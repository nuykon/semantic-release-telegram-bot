import {TGBotMessage, TGBotMessageTemplate} from '../interfaces/message';
import {TGBotRenderedMessage} from '../interfaces/rendered-message';
import {isMessage} from '../helpers/is-message';
import {template} from 'lodash';
import {extname} from 'path';
import * as nunjucks from 'nunjucks';
import * as telegramifyMarkdown from 'telegramify-markdown';

export function renderMessage(message: TGBotMessage | TGBotMessageTemplate, context: Record<string, unknown> = {}): TGBotRenderedMessage {
	if (isMessage(message)) {
		const templated: string = template(message.message)({...context, ...message.customData});
		const format = message.format ?? 'markdown';
		return {
			message: format === 'html' ? templated.trim() : renderMarkdown(templated),
			format
		}
	} else {
		return {
			message: renderFromTemplate(message, {...context, ...message.customData}),
			format: extname(message.path) === '.html' ? 'html' : 'markdown'
		}
	}
}

function renderMarkdown(message: string): string {
	return telegramifyMarkdown(stripUnsupportedHtml(message))
		// remark treats strings such as `Array<T>` as raw HTML and skips
		// MarkdownV2 escaping. Telegram still requires the closing bracket to
		// be escaped, otherwise the entire message is rejected.
		.replace(/<[^>\n]*>/g, rawHtml => rawHtml.replace(/>/g, '\\>'))
		.trim();
}

function stripUnsupportedHtml(message: string): string {
	// semantic-release changelog presets may wrap a Markdown release link in
	// <small>. MarkdownV2 does not support HTML, and leaving the wrapper in
	// place prevents the nested link from being rendered correctly.
	return message.replace(/<\/?small\s*>/gi, '');
}

function renderFromTemplate(template: TGBotMessageTemplate, context: Record<string, unknown>): string {
	nunjucks.configure(process.cwd(), {
		autoescape: false,
		trimBlocks: true,
	});
	return nunjucks.render(template.path, context).trim();
}
