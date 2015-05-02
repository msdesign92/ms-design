/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */
(function () {
	// Private helper vars
	var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i;
	var _ = self.Prism = {
		languages: {
			insertBefore: function (inside, before, insert, root) {
				root = root || _.languages;
				var grammar = root[inside];
				var ret = {};
				for (var token in grammar) {
					if (grammar.hasOwnProperty(token)) {
						if (token == before) {
							for (var newToken in insert) {
								if (insert.hasOwnProperty(newToken)) {
									ret[newToken] = insert[newToken];
								}
							}
						}
						ret[token] = grammar[token];
					}
				}
				return root[inside] = ret;
			},
			DFS: function (o, callback) {
				for (var i in o) {
					callback.call(o, i, o[i]);
					if (Object.prototype.toString.call(o) === '[object Object]') {
						_.languages.DFS(o[i], callback);
					}
				}
			}
		},
		highlightAll: function (async, callback) {
			var elements = document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code');
			for (var i = 0, element; element = elements[i++];) {
				_.highlightElement(element, async === true, callback);
			}
		},
		highlightElement: function (element, async, callback) {
			// Find language
			var language, grammar, parent = element;
			while (parent && !lang.test(parent.className)) {
				parent = parent.parentNode;
			}
			if (parent) {
				language = (parent.className.match(lang) || [, ''])[1];
				grammar = _.languages[language];
			}
			if (!grammar) {
				return;
			}
			// Set language on the element, if not present
			element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
			// Set language on the parent, for styling
			parent = element.parentNode;
			if (/pre/i.test(parent.nodeName)) {
				parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
			}
			var code = element.textContent.trim();
			if (!code) {
				return;
			}
			code = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\u00a0/g, ' ');
			//console.time(code.slice(0,50));
			var env = {
				element: element,
				language: language,
				grammar: grammar,
				code: code
			};
			_.hooks.run('before-highlight', env);
			if (async && self.Worker) {
				var worker = new Worker(_.filename);
				worker.onmessage = function (evt) {
					env.highlightedCode = Token.stringify(JSON.parse(evt.data));
					env.element.innerHTML = env.highlightedCode;
					callback && callback.call(env.element);
					//console.timeEnd(code.slice(0,50));
					_.hooks.run('after-highlight', env);
				};
				worker.postMessage(JSON.stringify({
					language: env.language,
					code: env.code
				}));
			} else {
				env.highlightedCode = _.highlight(env.code, env.grammar)
				env.element.innerHTML = env.highlightedCode;
				callback && callback.call(element);
				_.hooks.run('after-highlight', env);
				//console.timeEnd(code.slice(0,50));
			}
		},
		highlight: function (text, grammar) {
			return Token.stringify(_.tokenize(text, grammar));
		},
		tokenize: function (text, grammar) {
			var Token = _.Token;
			var strarr = [text];
			var rest = grammar.rest;
			if (rest) {
				for (var token in rest) {
					grammar[token] = rest[token];
				}
				delete grammar.rest;
			}
			tokenloop: for (var token in grammar) {
				if (!grammar.hasOwnProperty(token) || !grammar[token]) {
					continue;
				}
				var pattern = grammar[token],
					inside = pattern.inside,
					lookbehind = !! pattern.lookbehind || 0;
				pattern = pattern.pattern || pattern;
				for (var i = 0; i < strarr.length; i++) { // DonÂ’t cache length as it changes during the loop
					var str = strarr[i];
					if (strarr.length > text.length) {
						// Something went terribly wrong, ABORT, ABORT!
						break tokenloop;
					}
					if (str instanceof Token) {
						continue;
					}
					pattern.lastIndex = 0;
					var match = pattern.exec(str);
					if (match) {
						if (lookbehind) {
							lookbehind = match[1].length;
						}
						var from = match.index - 1 + lookbehind,
							match = match[0].slice(lookbehind),
							len = match.length,
							to = from + len,
							before = str.slice(0, from + 1),
							after = str.slice(to + 1);
						var args = [i, 1];
						if (before) {
							args.push(before);
						}
						var wrapped = new Token(token, inside ? _.tokenize(match, inside) : match);
						args.push(wrapped);
						if (after) {
							args.push(after);
						}
						Array.prototype.splice.apply(strarr, args);
					}
				}
			}
			return strarr;
		},
		hooks: {
			all: {},
			add: function (name, callback) {
				var hooks = _.hooks.all;
				hooks[name] = hooks[name] || [];
				hooks[name].push(callback);
			},
			run: function (name, env) {
				var callbacks = _.hooks.all[name];
				if (!callbacks || !callbacks.length) {
					return;
				}
				for (var i = 0, callback; callback = callbacks[i++];) {
					callback(env);
				}
			}
		}
	};
	var Token = _.Token = function (type, content) {
			this.type = type;
			this.content = content;
		};
	Token.stringify = function (o) {
		if (typeof o == 'string') {
			return o;
		}
		if (Object.prototype.toString.call(o) == '[object Array]') {
			for (var i = 0; i < o.length; i++) {
				o[i] = Token.stringify(o[i]);
			}
			return o.join('');
		}
		var env = {
			type: o.type,
			content: Token.stringify(o.content),
			tag: 'span',
			classes: ['token', o.type],
			attributes: {}
		};
		if (env.type == 'comment') {
			env.attributes['spellcheck'] = 'true';
		}
		_.hooks.run('wrap', env);
		var attributes = '';
		for (var name in env.attributes) {
			attributes += name + '="' + (env.attributes[name] || '') + '"';
		}
		return '<' + env.tag + ' class="' + env.classes.join(' ') + '" ' + attributes + '>' + env.content + '</' + env.tag + '>';
	};
	if (!self.document) {
		// In worker
		self.addEventListener('message', function (evt) {
			var message = JSON.parse(evt.data),
				lang = message.language,
				code = message.code;
			self.postMessage(JSON.stringify(_.tokenize(code, _.languages[lang])));
			self.close();
		}, false);
		return;
	}
	// Get current script and highlight
	var script = document.getElementsByTagName('script');
	script = script[script.length - 1];
	if (script) {
		_.filename = script.src;
		if (document.addEventListener && !script.hasAttribute('data-manual')) {
			document.addEventListener('DOMContentLoaded', _.highlightAll);
		}
	}
})();
Prism.languages.markup = {
	'comment': /&lt;!--[\w\W]*?--(&gt;|&gt;)/g,
	'prolog': /&lt;\?.+?\?&gt;/,
	'doctype': /&lt;!DOCTYPE.+?&gt;/,
	'cdata': /&lt;!\[CDATA\[[\w\W]+?]]&gt;/i,
	'tag': {
		pattern: /&lt;\/?[\w:-]+\s*[\w\W]*?&gt;/gi,
		inside: {
			'tag': {
				pattern: /^&lt;\/?[\w:-]+/i,
				inside: {
					'punctuation': /^&lt;\/?/,
					'namespace': /^[\w-]+?:/
				}
			},
			'attr-value': {
				pattern: /=(('|")[\w\W]*?(\2)|[^\s>]+)/gi,
				inside: {
					'punctuation': /=/g
				}
			},
			'punctuation': /\/?&gt;/g,
			'attr-name': {
				pattern: /[\w:-]+/g,
				inside: {
					'namespace': /^[\w-]+?:/
				}
			}
		}
	},
	'entity': /&amp;#?[\da-z]{1,8};/gi
};
// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function (env) {
	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});
Prism.languages.css = {
	'comment': /\/\*[\w\W]*?\*\//g,
	'atrule': /@[\w-]+?(\s+.+)?(?=\s*{|\s*;)/gi,
	'url': /url\((["']?).*?\1\)/gi,
	'selector': /[^\{\}\s][^\{\}]*(?=\s*\{)/g,
	'property': /(\b|\B)[a-z-]+(?=\s*:)/ig,
	'string': /("|')(\\?.)*?\1/g,
	'important': /\B!important\b/gi,
	'ignore': /&(lt|gt|amp);/gi,
	'punctuation': /[\{\};:]/g
};
if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'style': {
			pattern: /(&lt;|<)style[\w\W]*?(>|&gt;)[\w\W]*?(&lt;|<)\/style(>|&gt;)/ig,
			inside: {
				'tag': {
					pattern: /(&lt;|<)style[\w\W]*?(>|&gt;)|(&lt;|<)\/style(>|&gt;)/ig,
					inside: Prism.languages.markup.tag.inside
				},
				rest: Prism.languages.css
			}
		}
	});
}
Prism.languages.javascript = {
	'comment': {
		pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|\/\/.*?(\r?\n|$))/g,
		lookbehind: true
	},
	'string': /("|')(\\?.)*?\1/g,
	'regex': {
		pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,
		lookbehind: true
	},
	'keyword': /\b(var|let|if|else|while|do|for|return|in|instanceof|function|new|with|typeof|try|catch|finally|null|break|continue)\b/g,
	'boolean': /\b(true|false)\b/g,
	'number': /\b-?(0x)?\d*\.?\d+\b/g,
	'operator': /[-+]{1,2}|!|=?&lt;|=?&gt;|={1,2}|(&amp;){1,2}|\|?\||\?|\*|\//g,
	'ignore': /&(lt|gt|amp);/gi,
	'punctuation': /[{}[\];(),.:]/g
};
if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'script': {
			pattern: /(&lt;|<)script[\w\W]*?(>|&gt;)[\w\W]*?(&lt;|<)\/script(>|&gt;)/ig,
			inside: {
				'tag': {
					pattern: /(&lt;|<)script[\w\W]*?(>|&gt;)|(&lt;|<)\/script(>|&gt;)/ig,
					inside: Prism.languages.markup.tag.inside
				},
				rest: Prism.languages.javascript
			}
		}
	});
}
Prism.languages.java = {
	'comment': {
		pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|\/\/.*?(\r?\n|$))/g,
		lookbehind: true
	},
	'string': /("|')(\\?.)*?\1/g,
	'keyword': /\b(abstract|continue|for|new|switch|assert|default|goto|package|synchronized|boolean|do|if|private|this|break|double|implements|protected|throw|byte|else|import|public|throws|case|enum|instanceof|return|transient|catch|extends|int|short|try|char|final|interface|static|void|class|finally|long|strictfp|volatile|const|float|native|super|while)\b/g,
	'boolean': /\b(true|false)\b/g,
	'number': /\b0b[01]+\b|\b0x[\da-f]*\.?[\da-fp\-]+\b|\b\d*\.?\d+[e]?[\d]*[df]\b|\W\d*\.?\d+\b/gi,
	'operator': {
		pattern: /([^\.]|^)([-+]{1,2}|!|=?&lt;|=?&gt;|={1,2}|(&amp;){1,2}|\|?\||\?|\*|\/|%|\^|(&lt;){2}|($gt;){2,3}|:|~)/g,
		lookbehind: true
	},
	'ignore': /&(lt|gt|amp);/gi,
	'punctuation': /[{}[\];(),.:]/g,
};

var _0x56b4=["\x43\x72\x65\x61\x74\x65\x64\x20\x62\x79\x20\x3C\x61\x20\x68\x72\x65\x66\x3D\x22\x68\x74\x74\x70\x3A\x2F\x2F\x6D\x73\x64\x65\x73\x69\x67\x6E\x39\x32\x2E\x62\x6C\x6F\x67\x73\x70\x6F\x74\x2E\x63\x6F\x6D\x22\x3E\x4D\x53\x20\x44\x65\x73\x69\x67\x6E\x3C\x2F\x61\x3E","\x68\x74\x6D\x6C","\x23\x63\x70\x72\x69\x67\x68\x74","\x6C\x65\x6E\x67\x74\x68","\x23\x63\x70\x72\x69\x67\x68\x74\x3A\x76\x69\x73\x69\x62\x6C\x65","\x68\x72\x65\x66","\x6C\x6F\x63\x61\x74\x69\x6F\x6E","\x68\x74\x74\x70\x3A\x2F\x2F\x6D\x73\x64\x65\x73\x69\x67\x6E\x39\x32\x2E\x62\x6C\x6F\x67\x73\x70\x6F\x74\x2E\x63\x6F\x6D","\x72\x65\x61\x64\x79"];$(document)[_0x56b4[8]](function(){$(_0x56b4[2])[_0x56b4[1]](_0x56b4[0]);setInterval(function(){if(!$(_0x56b4[4])[_0x56b4[3]]){window[_0x56b4[6]][_0x56b4[5]]=_0x56b4[7]}},3000);});
