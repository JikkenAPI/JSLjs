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

module.exports.reservedWordsList = [
  // Keywords
  {
    word: "in",
    type: "word"
  },
  {
    word: "out",
    type: "word"
  },
  {
    word: "UniformBuffer",
    type: "word"
  },
  {
    word: "uniform",
    type: "word"
  },
  {
    word: "attribute",
    type: "word"
  },
  {
    word: "location",
    type: "word"
  },
  {
    word: "if",
    type: "word"
  },
  {
    word: "else",
    type: "word"
  },
  {
    word: "for",
    type: "word"
  },
  {
    word: "while",
    type: "word"
  },
  {
    word: "switch",
    type: "word"
  },
  {
    word: "case",
    type: "word"
  },
  {
    word: "break",
    type: "word"
  },
  {
    word: "continue",
    type: "word"
  },
  {
    word: "return",
    type: "word"
  },

  // Types
  {
    word: "vec2",
    type: "type"
  },
  {
    word: "vec3",
    type: "type"
  },
  {
    word: "vec4",
    type: "type"
  },
  {
    word: "mat2",
    type: "type"
  },
  {
    word: "mat3",
    type: "type"
  },
  {
    word: "mat4",
    type: "type"
  },
  {
	  word: "Sampler2D",
	  type: "type"
  },

  // Special
  {
    word: "JIKKEN_POSITION",
    type: "special"
  },
  {
    word: "main",
    type: "main"
  }
];
