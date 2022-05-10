module.exports = {
    createNavTab(navTabId, navTabName, navMenuId, navMenuContent) {
        if (!document.getElementById(navTabId)) {
            const navTab = document.getElementById("nav-tab");
            navTab.innerHTML +=
                `<a class="nav-link" id="${navTabId}" data-bs-toggle="tab" data-bs-target="#${navMenuId}" type="button"
                role="tab" aria-controls="${navMenuId}" aria-selected="false">${navTabName}
                <button type="button" class="btn-close" aria-label="Close" onclick="closeNavTabs('${navTabId}', '${navMenuId}')"></button></a>`;

            const navContent = document.getElementById("nav-tabContent");
            const contentElem = document.createElement('div');
            contentElem.classList.add('tab-pane');
            contentElem.id = `${navMenuId}`;
            contentElem.setAttribute('role', 'tabpanel');
            contentElem.setAttribute('aria-labelledby', `${navTabId}`);
            contentElem.innerHTML +=
                `<div class="p-3">
          ${navMenuContent}
        </div>`;
            navContent.appendChild(contentElem);

            const tab = new bootstrap.Tab(navTab.lastChild)
            tab.show()
        }
    },

    createModal(content, onclick, label, buttonLabel, buttons = "") {
        if (!document.getElementById("staticBackdrop")) {
            const modal = document.getElementById("modal");
            modal.innerHTML =
                `<div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false"
                tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="staticBackdropLabel">${label}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                aria-label="Close" onclick="closeModal()"></button>
                        </div>
                        <div class="modal-body">
                            ${content}
                        </div>
                        <div class="modal-footer">
                            ${buttons}
                            <button type="button" class="btn btn-primary" onclick="${onclick}">${buttonLabel}</button>
                        </div>
                    </div>
                </div>
            </div>`;

            bootstrap.Modal.getOrCreateInstance(document.getElementById("staticBackdrop")).show();
        }
    },

    createYesNoModal(onclick, label, content) {
        if (!document.getElementById("staticBackdrop")) {
            const modal = document.getElementById("modal");
            modal.innerHTML =
                `<div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false"
                tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="staticBackdropLabel">${label}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"
                                aria-label="Close" onclick="closeModal()"></button>
                        </div>
                        <div class="modal-body">
                            ${content}
                        </div>
                        <div class="modal-footer">
                            <button type="button"class="btn btn-secondary" data-bs-dismiss="modal" onclick="closeModal()">Нет</button>
                            <button type="button" class="btn btn-primary" onclick="${onclick}">Да</button>
                        </div>
                    </div>
                </div>
            </div>`;

            bootstrap.Modal.getOrCreateInstance(document.getElementById("staticBackdrop")).show();
        }
    }
}