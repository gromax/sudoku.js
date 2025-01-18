import { Events } from "../utils/events";

const DIVID = "messages";


class Messages {
    #dom;

    /**
     * constructeur
     * @param {Events} eventsGest
     */
    constructor(eventsGest){
        this.#dom = document.getElementById(DIVID);
        let self = this;

        eventsGest.addEvent("errorMessage", function(e,data){
            self.errorMessage(data.content);
        });

        eventsGest.addEvent("successMessage", function(e,data){
            self.successMessage(data.content);
        });

        eventsGest.addEvent("message", function(e,data){
            self.message(data.content);
        });
    }

    #makeDiv(content){
        let div = document.createElement("div");
        let text = document.createTextNode(content);
        div.appendChild(text);
        if (this.#dom){
            this.#dom.appendChild(div);
        } else {
            document.body.appendChild(div);
        }
        return div;
    }

    errorMessage(content) {
        let div = this.#makeDiv(content);
        div.classList.add("error");
    }

    successMessage(content) {
        let div = this.#makeDiv(content);
        div.classList.add("success");
    }

    message(content) {
        this.#makeDiv(content);
    }

}

export { Messages };