import {renderMessage} from '../src/common/render-message';
import {TGBotRenderedMessage} from '../src/interfaces/rendered-message';

describe('Render message', () => {
	describe('Markdown', () => {
		it('Message should render correctly', async () => {
			const renderedMessage: TGBotRenderedMessage = renderMessage({message: '**Title**\nContent'});

			expect(renderedMessage.message).toBe('*Title*\nContent');
			expect(renderedMessage.format).toBe('markdown');
		});

		it('Message should render context correctly', async () => {
			const renderedMessage: TGBotRenderedMessage = renderMessage({message: '**${title}**\n${content}'}, {title: 'Title', content: 'Content'});

			expect(renderedMessage.message).toBe('*Title*\nContent');
			expect(renderedMessage.format).toBe('markdown');
		});

		it('Message should escape closing angle brackets parsed as raw HTML', async () => {
			const renderedMessage: TGBotRenderedMessage = renderMessage({message: 'Support Array<T> values'});

			expect(renderedMessage.message).toBe('Support Array<T\\> values');
			expect(renderedMessage.format).toBe('markdown');
		});

		it('Message should preserve a release link and section heading after an unsupported small tag', async () => {
			const renderedMessage: TGBotRenderedMessage = renderMessage({
				message: [
					'<small>[3.7.6](https://gitlab.example/repository/-/releases/v3.7.6) (2026-08-20)</small>',
					'',
					'### ♻️ Рефакторинг:',
					'',
					'* refactor: update dependencies ([726a6a2](https://gitlab.example/repository/-/commit/726a6a2))'
				].join('\n')
			});

			expect(renderedMessage.message).toBe([
				'[3\\.7\\.6](https://gitlab.example/repository/-/releases/v3.7.6) \\(2026\\-08\\-20\\)',
				'',
				'*♻️ Рефакторинг:*',
				'',
				'•   refactor: update dependencies \\([726a6a2](https://gitlab.example/repository/-/commit/726a6a2)\\)'
			].join('\n'));
			expect(renderedMessage.format).toBe('markdown');
		});
	})

	describe('HTML', () => {
		it('Message should render correctly', async () => {
			const renderedMessage: TGBotRenderedMessage = renderMessage({message: '<b>Title</b>\nContent', format: 'html'});

			expect(renderedMessage.message).toBe('<b>Title</b>\nContent');
			expect(renderedMessage.format).toBe('html');
		});

		it('Message should render context correctly', async () => {
			const renderedMessage: TGBotRenderedMessage = renderMessage({message: '<b>${title}</b>\n${content}', format: 'html'}, {title: 'Title', content: 'Content'});

			expect(renderedMessage.message).toBe('<b>Title</b>\nContent');
			expect(renderedMessage.format).toBe('html');
		});

		it('Message should not convert HTML links as Markdown', async () => {
			const renderedMessage: TGBotRenderedMessage = renderMessage({message: '<a href="https://example.com?a=1&b=2">Link</a>', format: 'html'});

			expect(renderedMessage.message).toBe('<a href="https://example.com?a=1&b=2">Link</a>');
			expect(renderedMessage.format).toBe('html');
		});
	})
});

describe('Render template message', () => {
	describe('Markdown', () => {
		it('Message should render correctly', async () => {
			const renderedMessage: TGBotRenderedMessage = renderMessage({path: './tests/common/message.md'});

			expect(renderedMessage.message.replace(/\s+/g, "")).toBe('_Title_Content');
			expect(renderedMessage.format).toBe('markdown');
		});

		it('Message should render context correctly', async () => {
			const renderedMessage: TGBotRenderedMessage = renderMessage({path: './tests/common/message-context.md'}, {title: 'Title', content: 'Content'});

			expect(renderedMessage.message.replace(/\s+/g, "")).toBe('_Title_Content');
			expect(renderedMessage.format).toBe('markdown');
		});
	})

	describe('HTML', () => {
		it('Message should render correctly', async () => {
			const renderedMessage: TGBotRenderedMessage = renderMessage({path: './tests/common/message.html'});

			expect(renderedMessage.message.replace(/\s+/g, "")).toBe('<b>Title</b>Content');
			expect(renderedMessage.format).toBe('html');
		});

		it('Message should render context correctly', async () => {
			const renderedMessage: TGBotRenderedMessage = renderMessage({path: './tests/common/message-context.html'}, {title: 'Title', content: 'Content'});

			expect(renderedMessage.message.replace(/\s+/g, "")).toBe('<b>Title</b>Content');
			expect(renderedMessage.format).toBe('html');
		});
	})
});
