document.addEventListener("DOMContentLoaded", () => {

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

	function isSelected (attribute) {

		function check (node, fn) {

			try {

				return fn(node);

			} catch (e) {if (node.parentElement && node.parentElement.tagName !== "DIV") return fn(node.parentElement)}

		}

		const range = window.getSelection().getRangeAt(0);
		const selected = range.startOffset === range.endOffset ? [range.startContainer] : getSelectedNodes();

		if (attribute === "bold") return selected.every(_ => check(_, __ => __.closest("b, strong")));
		if (attribute === "italic") return selected.every(_ => check(_, __ => __.closest("i, *[fontStyle~=italic]")));
		if (attribute === "underline") return selected.every(_ => check(_, __ => __.closest("u")));

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

		for (const prop of properties) findEditor(event.target).querySelector(`.sashimi_editor__${prop}`).style.opacity = isSelected(prop) ? 1 : 0.5;

		findEditor(event.target).querySelector(".sashimi_editor__font_size").value = getFontSize() ? `${toPoint(getFontSize())}` : "";

	}

	document.addEventListener("click", event => {

		if (!event.target) return;

		if (event.target.classList.contains("sashimi_editor__bold")) document.execCommand("bold", false);
		if (event.target.classList.contains("sashimi_editor__italic")) document.execCommand("italic", false);
		if (event.target.classList.contains("sashimi_editor__underline")) document.execCommand("underline", false);

		if (event.target.closest(".sashimi_editor__textbox, .sashimi_editor__text_options")) {
	
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

	document.addEventListener("keyup", event => {

		if (!event.target) return;

		if (event.target.classList.contains("sashimi_editor__font_size")) {

			console.log("A")
			// document.execCommand("formatBlock", false, "<font-change>");			

		}

		if (event.target.closest(".sashimi_editor__textbox")) refreshControls();

	});

});

let __spro = () => {};
const __ssrc = document.currentScript.src;

const SashimiReady = new Promise(r => __spro = r);

(async () => {

	const editorSource = await (await fetch(`${__ssrc}/../editor.html`)).text();

	window.Sashimi = {

		createEditorAt (selector) {
	
			const base = document.querySelector(selector);
			const clone = base.cloneNode();

			base.innerHTML = editorSource;

		}
	
	}

	__spro(window.Sashimi);

})();
