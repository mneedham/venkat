import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from 'vscode';

// import * as venkat from '../../extension';
import {Language, parseLanguage, printExpression} from '../../language';


suite('Language Test Suite', () => {
	// vscode.window.showInformationMessage('Start all tests.');

	test('Python', () => {
		const lang: Language|null= parseLanguage("python");
		assert.ok(lang);
		assert.strictEqual("python", lang.executable);
		assert.strictEqual("py", lang.extension);
		assert.strictEqual("#", lang.comment);
		assert.strictEqual("print(${expression})", lang.output);
		assert.strictEqual("print(1+2)", printExpression(lang.output,printExpression(lang.output,"1+2")));
	});

	test('JavaScript', () => {
		const lang: Language | null = parseLanguage("javascript");
		assert.ok(lang);
		assert.strictEqual("node", lang.executable);
		assert.strictEqual("js", lang.extension);
		assert.strictEqual("//", lang.comment);
		assert.strictEqual('console.log(${expression});', lang.output);
		assert.strictEqual('console.log(1+2);', printExpression(lang.output,"1+2"));
		assert.strictEqual('console.log(1+2);', printExpression(lang.output,printExpression(lang.output,"1+2")));

	  });
	  
	  test('TypeScript', () => {
		const lang: Language | null = parseLanguage("typescript");
		assert.ok(lang);
		assert.strictEqual("ts-node", lang.executable);
		assert.strictEqual("ts", lang.extension);
		assert.strictEqual("//", lang.comment);
		assert.strictEqual('console.log(1+2);', printExpression(lang.output,"1+2"));
		assert.strictEqual('console.log(1+2);', printExpression(lang.output,printExpression(lang.output,"1+2")));
	  });
	  
	  test('Ruby', () => {
		const lang: Language | null = parseLanguage("ruby");
		assert.ok(lang);
		assert.strictEqual("ruby", lang.executable);
		assert.strictEqual("rb", lang.extension);
		assert.strictEqual("#", lang.comment);
		assert.strictEqual('puts(1+2);', printExpression(lang.output,"1+2"));
		assert.strictEqual('puts(1+2);', printExpression(lang.output,printExpression(lang.output,"1+2")));
	  });
	  
	  test('Java', () => {
		const lang: Language | null = parseLanguage("java");
		assert.ok(lang);
		assert.strictEqual("jshell -s", lang.executable);
		assert.strictEqual("java", lang.extension);
		assert.strictEqual("//", lang.comment);
		assert.strictEqual("/exit", lang.exit);
		assert.strictEqual('System.out.println(1+2);', printExpression(lang.output,"1+2"));
		assert.strictEqual('System.out.println(1+2);', printExpression(lang.output,printExpression(lang.output,"1+2")));
	  });
	  
	  test('Kotlin', () => {
		const lang: Language | null = parseLanguage("kotlin");
		assert.ok(lang);
		assert.strictEqual("kotlin", lang.executable);
		assert.strictEqual("kts", lang.extension);
		assert.strictEqual("//", lang.comment);
		assert.strictEqual('println(1+2);', printExpression(lang.output,"1+2"));
		assert.strictEqual('println(1+2);', printExpression(lang.output,printExpression(lang.output,"1+2")));
	  });
	  
	  test('PHP', () => {
		const lang: Language | null = parseLanguage("php");
		assert.ok(lang);
		assert.strictEqual("php -f", lang.executable);
		assert.strictEqual("php", lang.extension);
		assert.strictEqual("//", lang.comment);
		assert.strictEqual("?>", lang.exit);
		assert.strictEqual('print(1+2);', printExpression(lang.output,"1+2"));
		assert.strictEqual('print(1+2);', printExpression(lang.output,printExpression(lang.output,"1+2")));
	  });

	  test('Unsupported', () => {
		const lang: Language | null = parseLanguage("asciidoc");
		assert.strictEqual(lang, null);
	  });
	  
});
