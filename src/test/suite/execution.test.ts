import * as assert from 'assert';
import { prepareCode } from '../../execution';  // adjust this import path as needed

suite('Execution Test Suite', () => {
	test('prepareCode function with valid Python code', async () => {
		try {
			const [language, wrappedCode] = await prepareCode("'Hello World'", "python");
			assert.strictEqual(language.executable, 'python');
			assert.strictEqual(wrappedCode, "print('Hello World')");
		} catch (error) {
			if (error instanceof Error) {
				assert.fail(error);
			} else {
				assert.fail(error as string);
			}
		}
	});

	test('prepareCode function with valid Python code that prints its own result', async () => {
		try {
			const [language, wrappedCode] = await prepareCode("print('Hello World')", "python");
			assert.strictEqual(language.executable, 'python');
			assert.strictEqual(wrappedCode, "print('Hello World')");
		} catch (error) {
			if (error instanceof Error) {
				assert.fail(error);
			} else {
				assert.fail(error as string);
			}
		}
	});

	test('prepareCode function with valid Javascript code that prints its own result', async () => {
		try {
			const [language, wrappedCode] = await prepareCode("console.log(2)", "javascript");
			assert.strictEqual(language.executable, 'node');
			assert.strictEqual(wrappedCode, "console.log(2)");
		} catch (error) {
			if (error instanceof Error) {
				assert.fail(error);
			} else {
				assert.fail(error as string);
			}
		}
	});


	test('prepareCode function with commented Python code', async () => {
		try {
			const [language, wrappedCode] = await prepareCode("'Hello' # print('World')", "python");
			assert.strictEqual(language.executable, 'python');
			assert.strictEqual(wrappedCode, "print('Hello')");
		} catch (error) {
			if (error instanceof Error) {
				assert.fail(error);
			} else {
				assert.fail(error as string);
			}
		}
	});

	test('prepareCode function with unsupported language', async () => {
		try {
			await prepareCode("console.log('Hello World')", "unsupported-language");
			assert.fail('Expected function to throw, but it did not');
		} catch (error) {
			assert.strictEqual(error, `Language "unsupported-language" is not supported.`);
		}
	});

	test('prepareCode function with empty code', async () => {
		try {
			await prepareCode("", "python");
			assert.fail('Expected function to throw, but it did not');
		} catch (error) {
			assert.strictEqual(error, `No code selected`);
		}
	});
});