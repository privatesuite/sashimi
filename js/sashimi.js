document.addEventListener("DOMContentLoaded", () => {

	/**
	 * 
	 * @param {Element} root 
	 */
	function standardize (root) {

		for (const child of root.children) {

			if (!child.classList.contains("sashimi_editor__protected")) {
		
				child.style.color = "";
				child.style.fontSize = "";
				child.style.fontFamily = "";
				for (const attr of child.getAttributeNames()) {

					if (["href", "target", "type", "method", "action", "src", "style", "class"].indexOf(attr.toLowerCase()) === -1) child.removeAttribute(attr);
				
				}

				standardize(child);

			}

		}

	}

	/**
	 * 
	 * @param {Element} element 
	 * 
	 * @returns {Element}
	 */
	function findEditor (element) {

		return element.closest(".sashimi_editor");

	}
	
	/**
	 * 
	 * @param {Element} element 
	 * 
	 * @returns {Element}
	 */
	function findTextbox (element) {

		return findEditor(element).querySelector(".sashimi_editor__textbox");

	}

	/**
	 * 
	 * @param {Element} element 
	 * 
	 * @returns {Element}
	 */
	function findCodeTextbox (element) {

		return findEditor(element).querySelector(".sashimi_editor__code_textbox");

	}

	function getSelectedNodes () {
		
		const frag = window.getSelection().getRangeAt(0).cloneContents();

		const tempSpan = document.createElement("span");
		tempSpan.appendChild(frag);

		const selNodes = tempSpan.childNodes;

		const output = [];

		for (let i = 0; i < selNodes.length; i++) {

			output.push(selNodes[i]);

		}

		if (output.length === 1) return [window.getSelection().getRangeAt(0).startContainer];

		return output;
	
	}

	function lowestElements (elements) {

		const f = [];
		for (const element of elements) {

			if (element.children && element.children.length) f.push(...lowestElements([...element.children]));
			else return [element];

		}
		return f;

	}

	function isSelected (attribute) {

		function check (node, fn) {

			try {

				return fn(node);

			} catch (e) {if (node.parentElement && node.parentElement.tagName !== "P") return fn(node.parentElement)}

		}

		const range = window.getSelection().getRangeAt(0);
		let selected = range.startOffset === range.endOffset ? [range.startContainer] : getSelectedNodes();
		selected = lowestElements(selected);

		if (attribute === "bold") return selected.every(_ => check(_, __ => __.closest("b, strong")));
		if (attribute === "italic") return selected.every(_ => check(_, __ => __.closest("i, *[fontStyle~=italic]")));
		if (attribute === "underline") return selected.every(_ => check(_, __ => __.closest("u")));
		if (attribute === "h1") return range.startContainer === range.endContainer && range.startContainer.nodeName === "H1";

	}

	function getFontSize () {

		const range = window.getSelection().getRangeAt(0);
	
		let comm = range.commonAncestorContainer;
		if (!comm.tagName) comm = comm.parentElement;

		if (!comm.classList.contains("sashimi_editor__textbox")) {

			return parseFloat(getComputedStyle(comm).fontSize);

		} else return;
		
	}

	function toPoint (px) {

		return Math.round(px * 0.75);

	}

	function refreshControls () {

		const properties = ["bold", "italic", "underline"];

		[...findTextbox(event.target).querySelectorAll("span")].map(_ => _.replaceWith(document.createTextNode(_.innerText)));

		for (const prop of properties) findEditor(event.target).querySelector(`.sashimi_editor__${prop}`).style.opacity = isSelected(prop) ? 1 : 0.5;

		// if (event.target.closest(".sashimi_editor__textbox")) findEditor(event.target).querySelector(".sashimi_editor__font_size").value = getFontSize() ? `${toPoint(getFontSize())}` : "";

	}

	document.addEventListener("click", event => {

		if (!event.target) return;

		if (event.target.classList.contains("sashimi_editor__p")) document.execCommand("formatBlock", true, "p");
		if (event.target.classList.contains("sashimi_editor__h1")) document.execCommand("formatBlock", true, "h1");
		if (event.target.classList.contains("sashimi_editor__h2")) document.execCommand("formatBlock", true, "h2");
		if (event.target.classList.contains("sashimi_editor__h3")) document.execCommand("formatBlock", true, "h3");

		if (event.target.classList.contains("sashimi_editor__bold")) document.execCommand("bold", false);
		if (event.target.classList.contains("sashimi_editor__italic")) document.execCommand("italic", false);
		if (event.target.classList.contains("sashimi_editor__underline")) document.execCommand("underline", false);
		if (event.target.classList.contains("sashimi_editor__anchor")) {
			
			const link = prompt("Enter URL:");

			if (link.trim()) document.execCommand("createLink", false, link);
			else document.execCommand("unlink", false);

		}
		if (event.target.classList.contains("sashimi_editor__image")) {
			
			let link = prompt("Please enter the URL of image you'd like to add:");

			if (link.trim()) {
			
				if (!link.startsWith("http")) link = `${__sopt.imageRoot}${link}`;

				document.execCommand("insertImage", false, link);

			}

		}
		if (event.target.classList.contains("sashimi_editor__create_half_split")) {
			
			document.execCommand("insertHTML", false, `<div class="split sashimi_editor__protected"><div style="width: 50%;"><p>Left</p></div><div style="width: 50%;"><p>Right</p></div></div><p>Under the split</p>`);

		}

		if (window.getSelection().focusNode && event.target.closest(".sashimi_editor__textbox, .sashimi_editor__text_options")) {
	
			refreshControls();
			[...findEditor(event.target).querySelectorAll(".sashimi_editor__placeholder")].map(_ => _.remove());

		}

		if (event.target.classList.contains("sashimi_editor__switch_mode")) {

			const editor = findEditor(event.target);
			const textbox = findTextbox(event.target);
			const codeTextbox = findCodeTextbox(event.target);

			if (editor.getAttribute("data-mode") === "code") {

				textbox.style.display = "block";
				codeTextbox.style.display = "none";
				[...editor.querySelectorAll(".sashimi_editor__text_options")].map(_ => _.style.display = "inline-block");

				editor.setAttribute("data-mode", "normal");

				textbox.innerHTML = codeTextbox.value;

			} else {

				textbox.style.display = "none";
				codeTextbox.style.display = "block";
				[...editor.querySelectorAll(".sashimi_editor__text_options")].map(_ => _.style.display = "none");

				editor.setAttribute("data-mode", "code");

				codeTextbox.value = textbox.innerHTML.trim();

			}

		} else if (event.target.classList.contains("sashimi_editor__strip")) {

			const textbox = findTextbox(event.target);

			[...textbox.querySelectorAll("*[style]")].map(_ => _.setAttribute("style", ""));

		} else if (event.target.tagName === "A" && event.target.closest(".textarea") && event.target.closest(".sashimi_editor") && window.event.ctrlKey) {

			window.open(event.target.href, "_blank").focus();

		}

	});

	document.addEventListener("keydown", event => {

		if (!event.target) return;

		if (event.target.closest(".sashimi_editor__textbox") && event.key.toLowerCase() === "backspace" && !event.target.closest(".sashimi_editor__textbox").innerText.trim()) {

			event.preventDefault();
			return false;

		} else if (event.target.closest(".sashimi_editor__textbox") && event.key.toLowerCase() === "v" && event.ctrlKey) {

			setTimeout(() => {

				standardize(event.target.closest(".sashimi_editor__textbox"));
			
			}, 1);

		}

	});

	document.addEventListener("keyup", event => {

		if (!event.target) return;

		if (event.target.closest(".sashimi_editor__textbox")) {
			
			refreshControls();

		}

	});

});

let __spro = () => {};
const __ssrc = document.currentScript.src;
let __sopt = {imageRoot: ""};

const SashimiReady = new Promise(r => __spro = r);

(async () => {

	const editorSource = await (await fetch(`${__ssrc}/../editor.html`)).text();

	function stripHtml (html) {

		const tmp = document.createElement("DIV");
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText || "";

	}

	window.Sashimi = {

		createEditorAt (selector) {
	
			const base = document.querySelector(selector);
			
			document.execCommand("styleWithCSS", true, false)
			document.execCommand("defaultParagraphSeparator", false, "p");

			base.innerHTML = editorSource;

		},

		setHTML (selector, html) {

			document.querySelector(selector).querySelector(".sashimi_editor__textbox").innerHTML = html;
			document.querySelector(selector).querySelector(".sashimi_editor__code_textbox").value = html;

		},

		extractHTML (selector) {

			return document.querySelector(selector).querySelector(".sashimi_editor__textbox").innerHTML.trim();

		},

		extractText (selector) {

			return stripHtml(this.extractHTML(selector));
			
		},

		setImageRoot (root) {

			__sopt.imageRoot = root;

		}
	
	}

	__spro(window.Sashimi);

})();
