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

var shader = require('./lib/processShader');
var gatherPass = require('./lib/gatherPass');

function main(argv) {
	if (argv.length < 4) {
	console.log("Usage: node main.js --vertex <vertex shader file> --fragment <fragment shader file>")
	return;
	}

	var shaders = [];

	for (var i = 0; i < argv.length; i++) {
		switch (argv[i]) {
			case '--vertex':
				if (i+1 == argv.length) {
					console.log("Next argument must be a vertex shader file.");
					return;
				}

				shaders.push({
					type: 'VERTEX',
					file: argv[i + 1]
				});
				i++;
				break;
			case '--fragment':
				if (i+1 == argv.length) {
					console.log("Next argument must be a fragment shader file.")
					return;
				}

				shaders.push({
					type: 'FRAGMENT',
					file: argv[i + 1]
				});
				break;
		}
	}

	shaders.forEach((sh) => {
		shader.processShader(sh);
		var gatherPassTokens = gatherPass.gatherPass(shader.lex);
		shader.rewindLex();

		console.log("Shader: " + sh.file);
		console.log(JSON.stringify(gatherPassTokens));

		shader.resetLex();
	});
}

main(process.argv);
