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
		//console.log(lex);
		return lex;
	}

	var inputData = {};
	var outputData = {};
	var uniformBuffers = []; // UniformBuffer
	var uniforms = []; // Sampler2D
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
		if (!(lex.nextToken.token === tokenList.IDENTIFIER || lex.nextToken.token === tokenList.SPECIAL || lex.nextToken.token === tokenList.NUMBER)) {
			console.log("Syntax error. Must have identifier or constant integer after assignment for location.");
			return null;
		}
		if (lex.nextToken.token === tokenList.IDENTIFIER || lex.nextToken.token === tokenList.SPECIAL)
			location = lex.nextToken.identifier;
		else
			location = lex.nextToken.number;

		// check for )
		lex = lexFN();
		if (lex.nextToken.token !== tokenList.RIGHT_PAREN) {
			console.log("Syntax error. Must have ) after ending of attribute.");
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
					case 'out':
						var theType = lex.nextToken.identifier;

						// If it doesn't have an identifier right after,it's not an
						// input layout. Just stop.
						if ((identifier = getIdentifier()) === null)
							break;

						var obj = {};

						obj.name = identifier;
						obj.attributeList = [];

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
								return null;

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
							obj.attributeList.push({
								'location': attribute.location,
								'type': typeName,
								'name': name
							});

							// skip new lines.
							skipNewLines();
						} while (lex.lookAhead.token !== tokenList.RIGHT_BRACE);

						lex = lexFN();
						if (lex.nextToken.token !== tokenList.RIGHT_BRACE || lex.lookAhead.token !== tokenList.TERMINATOR) {
							console.log("Syntax error. Must have a right brace followed by a terminator.");
							return null;
						}

						if (theType === 'in')
							inputData = obj;
						else if (theType === 'out')
						 	outputData = obj;
						else {
							console.log("INTERNAL ERROR : only in/out defined for attribute lists!");
							return null;
						}

						break;
					case 'UniformBuffer':
						if ((identifier = getIdentifier()) === null)
							break;

							lex = lexFN();
							if (lex.nextToken.token !== tokenList.SPECIAL || lex.nextToken.op !== ':') {
								console.log("Syntax error. Must have token ':' after IDENTIFIER within an Uniform Buffer layout.");
								return null;
							}

							// Skip any new lines that could possibly be in there.
							skipNewLines();

							// Grab attribute.
							var attribute = getAttribute();
							if (attribute === null) {
								console.log("Syntax error. Must have attribute declaration in Uniform Buffer layout.");
								return null;
							}

							// Skip new lines.
							skipNewLines();

							lex = lexFN();
							if (lex.nextToken.token !== tokenList.LEFT_BRACE) {
								console.log("Syntax error. Must have a '{' when starting Uniform Buffer variable list.");
								return null;
							}

							// Skip new lines.
							skipNewLines();

							var obj = {};
							obj.name = identifier;
							obj.location = attribute.location;
							obj.fields = [];

							// Get field list.
							do {
								// Get type. and then name.
								lex = lexFN();
								if (lex.nextToken.token !== tokenList.TYPE) {
									console.log("Syntax error. Must have a type qualifier.");
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
									console.log("Syntax error. Must have a ; after name of declaration.");
									return null;
								}

								// Shove a new attribute onto the list.
								obj.fields.push({
									'type': typeName,
									'name': name
								});

								// skip new lines.
								skipNewLines();
							} while (lex.lookAhead.token !== tokenList.RIGHT_BRACE);

							lex = lexFN();
							if (lex.nextToken.token !== tokenList.RIGHT_BRACE || lex.lookAhead.token !== tokenList.TERMINATOR) {
								console.log("Syntax error. Must have a right brace followed by a terminator.");
								return null;
							}

							uniformBuffers.push(obj);
						break;
					case 'uniform':
						lex = lexFN();
						if (lex.nextToken.token !== tokenList.TYPE || lex.lookAhead.token !== tokenList.IDENTIFIER) {
							console.log("Syntax error. Uniforms must be declared as follows: uniform <TYPE> <IDENTIFIER>;");
							return null;
						}
						var uniformType = lex.nextToken.identifier;

						lex = lexFN();
						var id = lex.nextToken.identifier;
						lex = lexFN();

						if (lex.nextToken.token !== tokenList.SPECIAL || lex.nextToken.op !== ':') {
							console.log("Syntax error. Must have a ':' operator and an attribute declaration in declaring a uniform.");
							return false;
						}

						// Skip any new lines that could possibly be in there.
						skipNewLines();

						// Grab attribute.
						var attribute = getAttribute();
						if (attribute === null) {
							console.log("Syntax error. Must have attribute declaration in Uniform Buffer layout.");
							return null;
						}

						// Skip new lines.
						skipNewLines();

						lex = lexFN();
						if (lex.nextToken.token !== tokenList.TERMINATOR) {
							console.log("Syntax error. Need a terminator symbol on uniform declaration.");
							return null;
						}

						uniforms.push({
							'type': uniformType,
							'identifier': id,
							'location': attribute.location
						});

						break;
				}
				break;
		}
	}

	return {
		'inputData': inputData,
		'outputData': outputData,
		'uniformBuffers': uniformBuffers,
		'uniforms': uniforms
	};
};
