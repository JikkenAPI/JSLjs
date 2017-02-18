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
var reservedWordList = require('./reservedWordList');
var tokenList = require('./tokens.js');

module.exports.processShader = (shaderData) => {
  var contents = fs.readFileSync(shaderData.file);
  var tokens = tokenize(contents, shaderData.type);
};

var tokens = [];
var currToken = 0;

function lex() {
  // Need to have room for lookAhead.
  if (currToken === (tokens.length - 2))
    return null;

  var ret = {
    nextToken: tokens[currToken],
    lookAhead: tokens[currToken + 1]
  };
  currToken++;
  return ret;
}

function tokenize(str, type) {
  var char = "";
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
    if (currentPos < len) {
      tokens.push({
        token: tokenList.EOF
      });
      return null;
    }
    return str[currentPos];
  }

  // get next character
  while ((char = skipWhiteSpace()) !== null) {
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
      case '+':
      case '-':
      case '%':
        tokens.push({
          token: tokenList.MATH_OP,
          op: char
        });
        break;
      default:
        // We need to parse more letters.
        var word = char;

        if (word.match(/[0-9]/)) {
          // It's a number.
          // keep going until we don't hit a number.
          var foundDot = false;
          while (true) {
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
              break;
            }
          }

          // We have our number token. Push it.
          tokens.push({
            token: tokenList.NUMBER,
            number: word
          });
        } else {
          // It's a potential identifier.
        }
    }
  }
}
