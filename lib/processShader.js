// The Jikken Shading Language Transpiler
//
// Copyright (c) 2017 Jeffrey Hutchinson
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

var fs = require('fs');
var reservedWordList = require('./reservedWords').reservedWordsList;
var tokenList = require('./tokens');

var tokens = [];
var currToken = 0;

module.exports.lex = () => {
	// Need to have room for lookAhead.
	if (currToken >= (tokens.length - 2))
	return null;

	var ret = {
		nextToken: tokens[currToken],
		lookAhead: tokens[currToken + 1]
	};
	currToken++;
	return ret;
};

module.exports.resetLex = () => {
	currToken = 0;
	tokens = [];
};

module.exports.rewindLex = () => {
	currToken = 0;
};

module.exports.processShader = (shaderData) => {
	var contents = fs.readFileSync(shaderData.file);
	tokenize(contents.toString(), shaderData.type);
	//console.log(tokens);
};

function tokenize(_str, type) {
	var char = "";
	var str = _str.split("");
	var len = str.length;
	var currentPos = 0;
	var currentLine = 1;

	function skipWhiteSpace() {
		while (currentPos < len) {
			if (str[currentPos] === ' ' || str[currentPos] === '\t' || str[currentPos] === '\r') {
				currentPos++;
				continue;
			} else if (str[currentPos] === '\n') {
				tokens.push({
					token: tokenList.NEW_LINE
				});
				currentPos++;
				currentLine++;
				continue;
			}
			break;
		}

		// If we've hit the end of the stream, push a end of file token and
		// return null.
		if (currentPos >= len) {
			tokens.push({
				token: tokenList.EOF
			});
			return null;
		}
		return str[currentPos];
	}

	// Peeks at the next character into the stream.
	function peekNextCharacter() {
		if ((currentPos + 1) < len)
			return str[currentPos + 1];
		return null;
	}

	function handleNumber() {
		var word = "";

		var foundDot = false;
		while (currentPos < len) {
			var c = str[currentPos];
			if (c === '.') {
				if (foundDot) {
					// We already have a dot. Error.
					console.log("Syntax error on line " + line + ". Cannot have more than 1 period in a number.");
					return;
				}
				word += c;
				foundDot = true;
				currentPos++;
			} else if (c.match(/[0-9]/)) {
				word += c;
				currentPos++;
			} else {
				// Done.
				currentPos--;
				break;
			}
		}

		// We have our number token. Push it.
		tokens.push({
			token: tokenList.NUMBER,
			number: word
		});
	}

	function handleIdentifier() {
		var identifier = "";
		for (; currentPos < len; currentPos++) {
			var c = str[currentPos];
			if (c.match(/[A-Za-z0-9_]/)) {
				identifier += c;
			} else {
				currentPos--;
				break;
			}
		}
		return identifier;
	}

	// get next character
	while ((char = skipWhiteSpace()) !== null) {
		//console.log("Looking at char: " + char);
		var lookAheadChar = peekNextCharacter();
		switch (char) {
			case '(':
				tokens.push({
					token: tokenList.LEFT_PAREN
				});
				break;
			case ')':
				tokens.push({
					token: tokenList.RIGHT_PAREN
				});
				break;
			case '{':
				tokens.push({
					token: tokenList.LEFT_BRACE
				});
				break;
			case '}':
				tokens.push({
					token: tokenList.RIGHT_BRACE
				});
				break;
			case '[':
				tokens.push({
					token: tokenList.LEFT_BRACE
				});
				break;
			case ']':
				tokens.push({
					token: tokenList.RIGHT_BRACE
				});
				break;
			case '?':
				tokens.push({
					token: tokenList.SPECIAL,
					op: '?'
				});
				break;
			case ':':
				tokens.push({
					token: tokenList.SPECIAL,
					op: ':'
				});
				break;
			case ',':
				tokens.push({
					token: tokenList.SPECIAL,
					op: ','
				});
				break;
			case '.':
				tokens.push({
					token: tokenList.SPECIAL,
					op: '.'
				});
				break;
			case ';':
				tokens.push({
					token: tokenList.TERMINATOR
				});
				break;
			case '+':
				// Check for ++ and +=
				if (lookAheadChar === '+') {
					tokens.push({
						token: tokenList.ASSIGNMENT_OP,
						op: '++'
					});
					// Up current pos since we're using 2 characters.
					currentPos++;
				} else if (lookAheadChar === '=') {
					tokens.push({
						token: tokenList.ASSIGNMENT_OP,
						op: '+='
					});
					// Up current pos since we're using 2 characters.
					currentPos++;
				} else {
					tokens.push({
						token: tokenList.MATH_OP,
						op: '+'
					});
				}
				break;
			case '-':
				// Check for --, -=
				if (lookAheadChar === '-') {
					tokens.push({
						token: tokenList.ASSIGNMENT_OP,
						op: '--'
					});

					// Up current pos since we're using 2 characters.
					currentPos++;
				} else if (lookAheadChar === '=') {
					tokens.push({
						token: tokenList.ASSIGNMENT_OP,
						op: '-='
					});

					// Up current pos since we're using 2 characters.
					currentPos++;
				} else {
					tokens.push({
						token: tokenList.MATH_OP,
						op: '-'
					});
				}
				break;
			case '*':
				if (lookAheadChar === '=') {
					tokens.push({
						token: tokenList.ASSIGNMENT_OP,
						op: '*='
					});

					// Up current pos since we're using 2 characters.
					currentPos++;
				} else {
					tokens.push({
						token: tokenList.MATH_OP,
						op: '*'
					});
				}
				break;
			case '/':
				// handle comments!
				if (lookAheadChar === '/') {
					// Go to after \n character.
					currentPos+=2;
					var comment = "//";
					while (str[currentPos] !== '\n') {
						// Check for carriage return
						if (str[currentPos] === '\r' && peekNextCharacter() === '\n')
							break;
						comment += str[currentPos];
						currentPos++;
					}
					tokens.push({
						token: tokenList.COMMENT,
						text: comment
					});
				} else if (lookAheadChar === '=') {
					tokens.push({
						token: tokenList.ASSIGNMENT_OP,
						op: '/='
					});

					// Up current pos since we're using 2 characters.
					currentPos++;
				} else {
					tokens.push({
						token: tokenList.MATH_OP,
						op: '/'
					});
				}
				break;
			case '%':
				// Check for %=
				if (lookAheadChar === '=') {
					tokenks.push({
						token: tokenList.ASSIGNMENT_OP,
						op: '%='
					});
					// Up current pos since we're using 2 characters.
					currentPos++;
				} else {
					tokens.push({
						token: tokenList.MATH_OP,
						op: '%'
					});
				}
				break;
			case '!':
				if (lookAheadChar === '=') {
					tokens.push({
						token: tokenList.COMPARISON_OP,
						op: '!='
					});
					// Up current pos since we're using 2 characters.
					currentPos++;
				} else {
					tokens.push({
						token: tokenList.LOGIC_OP,
						op: '!'
					});
				}
				break;
			case '=':
				if (lookAheadChar === '=') {
					tokens.push({
						token: tokenList.COMPARISON_OP,
						op: '=='	
					});
					// using 2 chars...
					currentPos++;
				} else {
					tokens.push({
						token: tokenList.ASSIGNMENT_OP,
						op: '='
					});
				}
				break;
			case '<':
				if (lookAheadChar === '=') {
					tokens.push({
						token: tokenList.COMPARISON_OP,
						op: '<='
					});
					// Up current pos since we're using 2 characters.
					currentPos++;
				} else if (lookAheadChar === '<') {
					// check for <<= or <<
					if (peekNextCharacter() === '=') {
						tokens.push({
							token: tokenList.ASSIGNMENT_OP,
							op: '<<='
						});
						// Up current pos by 2 since we're using 3 characters.
						currentPos += 2;
					} else {
						// Up current pos since we're using 2 characters.
						tokens.push({
							token: tokenList.LOGIC_OP,
							op: '<<'
						});
						currentPos++;
					}
				} else {
					tokens.push({
						token: tokenList.COMPARISON_OP,
						op: '<'
					});
				}
				break;
			case '>':
				if (lookAheadChar === '=') {
					tokens.push({
					token: tokenList.COMPARISON_OP,
					op: '>='
					});
					// up current pos.
					currentPos++;
				} else if (lookAheadChar === '>') {
					// check for >>= and >>
					if (peekNextCharacter() === '=') {
						tokens.push({
							token: tokenList.ASSIGNMENT_OP,
							op: '>>='
						});
						currentPos += 2;
					} else {
						tokens.push({
							token: tokenList.LOGIC_OP,
							op: '>>'
						});
						currentPos++;
					}
				} else {
					tokens.push({
						token: tokenList.COMPARISON_OP,
						op: '>'
					});
				}
				break;
			case '|':
				if (lookAheadChar === '|') {
					tokens.push({
						token: tokenList.COMPARISON_OP,
						op: '||'
					});
					currentPos++;
				} else if (lookAheadChar === '=') {
					tokens.push({
						token: tokenList.ASSIGNMENT_OP,
						op: '|='
					});
					currentPos++;
				} else {
					tokens.push({
						token: tokenList.LOGIC_OP,
						op: '|'
					});
				}
				break;
			case '&':
				if (lookAheadChar === '&') {
					tokens.push({
						token: tokenList.COMPARISON_OP,
						op: '&&'
					});
					currentPos++;
				} else if (lookAheadChar === '=') {
					tokens.push({
						token: tokenList.ASSIGNMENT_OP,
						op: '&='
					});
					currentPos++;
				} else {
					tokens.push({
						token: tokenList.LOGIC_OP,
						op: '&'
					});
				}
				break;
			case '^':
				if (lookAheadChar === '^') {
					tokens.push({
						token: tokenList.COMPARISON_OP,
						op: '^^'
					});
					currentPos++;
				} else if (lookAheadChar === '=') {
					tokens.push({
						token: tokenList.ASSIGNMENT_OP,
						op: '^='
					});
					currentPos++;
				} else {
					tokens.push({
						token: tokenList.LOGIC_OP,
						op: '^'
					});
				}
				break;
			default:
				// We need to parse more letters.
				var word = char;

				if (word.match(/[0-9]/)) {
					// It's a number.
					// keep going until we don't hit a number.
					handleNumber();
				} else {
					// It's a potential identifier, but it could also be a keyword.
					var identifier = handleIdentifier();

					var found = false;

					// Now, let's see if we are within the keyword list.
					for (var i = 0; i < reservedWordList.length; i++) {
						var obj = reservedWordList[i];
						if (obj.word === identifier) {
							switch (obj.type) {
								case "word":
									tokens.push({
										token: tokenList.RESERVED_WORD,
										identifier: obj.word
									});
									break;
								case "type":
									tokens.push({
										token: tokenList.TYPE,
										identifier: obj.word
									});
									break;
								case "special":
									tokens.push({
										token: tokenList.SPECIAL,
										identifier: obj.word
									});
									break;
								case "main":
									tokens.push({
										token: tokenList.MAIN,
										identifier: obj.word
									});
									break;
								default:
									// This shouldn't happen unless the programmer didn't implement
									// all of the types. Sanity check for development.
									console.log("CODER ERROR: IMPLEMENT TYPE OF IDENTIFIER : " + obj.type);
									return;
							}

							// We found it.
							found = true;
							break;
						}
					}

					// If we haven't found one, go ahead and assume it's an identifier!!
					if (!found) {
						tokens.push({
							token: tokenList.IDENTIFIER,
							identifier: identifier
						});
					}
				}
		}
		currentPos++;
	}
}
