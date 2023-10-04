/**
 * @author Lazy
 * @description 弹窗组件
 * 能用，但只能用一点点。纯摆设
 */

class Notify {
  private title!: string;
  private content!: string;
  private status!: string;

  constructor() {
    let notifyBox = document.createElement("div");
    notifyBox.id = "notifyBox";
    document.body.appendChild(notifyBox);
  }

  init(title: string, content: string, status: string) {
    this.title = title;
    this.content = content;
    this.status = status;
    this.show();
  }

  async show() {
    let div = document.createElement("div");
    let nid = Date.now();
    div.className = "notifyyy";
    div.setAttribute("nid", String(nid));
    div.innerHTML = `
    <h2>${this.title}</h2>
    <p>${this.content}</p>
    `;
    document.querySelector("#notifyBox")?.appendChild(div);
    setTimeout(() => {
      document.querySelector(`div[nid="${nid}"]`)?.remove();
    }, 3000);
  }
}

export default Notify;
