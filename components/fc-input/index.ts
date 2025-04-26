import "./style.css";
import checkmarkImage from "./assets/checkmark.svg";

export class FcInput extends HTMLElement {
  constructor() {
    super();

    const childAttrs = ["name", "type", "value", "checked", "required", "readonly", "aria-label"];

    this.classList.add("fc-input");
    const type = this.getAttribute("type");
    if (type !== null) {
      this.classList.add(`fc-input-${type}`);
    }

    const input = document.createElement("input");
    for (const name of childAttrs) {
      const value = this.getAttribute(name);
      if (value !== null) {
        input.setAttribute(name, value);
        this.removeAttribute(name);
      }
    }
    this.append(input);

    if (input.type === "text") {
      const div = document.createElement("div");
      div.classList.add("placeholder");
      div.innerText = input.value;
      this.append(div);
      input.addEventListener("input", () => {
        div.innerText = input.value;
      });
    } else if (input.type === "checkbox") {
      const circle = document.createElement("div");
      circle.classList.add("circle");
      this.append(circle);
      const checkmark = document.createElement("div");
      checkmark.classList.add("checkmark");
      console.log(checkmarkImage);
      checkmark.style.backgroundImage = `url("${checkmarkImage}")`;
      circle.append(checkmark);
    }
  }
}
