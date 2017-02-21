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

var tokenList = require('./tokens');

module.exports.gatherPass = (_lexFN) => {
	function lexFN() {
		var lex = _lexFN();
		console.log(lex);
		return lex;
	}

	var inputData = {};
	var outputData = {};
	var uniforms = [];
	var lex = lexFN();

	function skipNewLines() {
		while (lex.lookAhead.token === tokenList.NEW_LINE)
			lex = lexFN();
	}

	function getIdentifier() {
		// Make sure the lookAhead token is an identifier.
		if (lex.lookAhead.token !== tokenList.IDENTIFIER) {
			console.log("Syntax error. Must have token " + lex.nextToken.identifier + " be followed by an Identifier");
			return null;
		}

		// Get identifier
		lex = lexFN();
		var identifier = lex.nextToken.identifier;

		// Skip new lines.
		skipNewLines();

		return identifier;
	}

	function getAttribute() {
		var attribute = {};

		lex = lexFN();
		if (lex.nextToken.token !== tokenList.RESERVED_WORD || lex.nextToken.identifier !== 'attribute') {
			console.log("Syntax error. Must have attribute declared for input type.");
			return null;
		}
		// Skip (
		lex = lexFN();
		if (lex.nextToken.token !== tokenList.LEFT_PAREN) {
			console.log("Syntax error. Must have ( after attribute.");
			return null;
		}

		// get location
		lex = lexFN();
		if (lex.nextToken.token !== tokenList.RESERVED_WORD || lex.nextToken.identifier !== 'location') {
			console.log("Syntax error. Must have location as part of attribute.");
			return null;
		}
		lex = lexFN();
		if (lex.nextToken.token !== tokenList.ASSIGNMENT_OP || lex.nextToken.op !== '=') {
			console.log("Syntax error. Must have assignment after location.");
			return null;
		}
		lex = lexFN();
		var location = null;
		if (!(lex.nextToken.token === tokenList.IDENTIFIER || lex.nextToken.token === tokenList.SPECIAL)) {
			console.log("Syntax error. Must have identifier after assignment for location.");
			return null;
		}
		location = lex.nextToken.identifier;

		// check for )
		lex = lexFN();
		if (lex.nextToken.token !== tokenList.RIGHT_PAREN) {
			console.log("Syntaex error. Must have ) after ending of attribute.");
			return null;
		}

		attribute.location = location;
		return attribute;
	}

	for (; lex != null; lex = lexFN()) {
		switch (lex.nextToken.token) {
			case tokenList.RESERVED_WORD:
				var identifier;
				switch (lex.nextToken.identifier) {
					case 'in':
						if ((identifier = getIdentifier()) === null)
							return null;

						inputData.name = identifier;
						inputData.attributeList = [];

						lex = lexFN();
						if (lex.nextToken.token !== tokenList.LEFT_BRACE) {
							console.log("Syntax error. Must have token '{' after IDENTIFIER within an input layout.");
							return null;
						}

						// Skip new lines.
						skipNewLines();

						// Get attribute list.
						do {
							var attribute = getAttribute();
							if (attribute === null)
								return;

							// Get type. and then name.
							lex = lexFN();
							if (lex.nextToken.token !== tokenList.TYPE) {
								console.log("Syntax error. Must have a type qualifier follow attribute.");
								return null;
							}
							var typeName = lex.nextToken.identifier;

							lex = lexFN();
							if (lex.nextToken.token !== tokenList.IDENTIFIER) {
								console.log("Syntax error. Must have an identifier after type.");
								return null;
							}
							var name = lex.nextToken.identifier;

							// check for ;
							lex = lexFN();
							if (lex.nextToken.token !== tokenList.TERMINATOR) {
								console.log("Syntax error. Must have a ; after name of attribute declaration.");
								return null;
							}

							// Shove a new attribute onto the list.
							inputData.attributeList.push({
								'location': attribute.location,
								'type': typeName,
								'name': name
							});

							// skip new lines.
							skipNewLines();
						} while (lex.lookAhead.token !== tokenList.RIGHT_BRACE);

						break;
					case 'out':
						//if ((identifier = getIdentifier()) === null)
							//return;
						break;
					case 'UniformBuffer':
						//if ((identifier = getIdentifier()) === null)
							//return;
						break;
					case 'uniform':
						//if ((identifier = getIdentifier()) === null)
							//return;
						break;
				}
				break;
		}
	}

	console.log("InputData: ");
	console.log(inputData);

	return {
		'inputData': inputData,
		'outputData': outputData,
		'uniforms': uniforms
	};
};
