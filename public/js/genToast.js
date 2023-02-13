const toastContainer = $("#toastContainer");
let idCount = 0;
const makeToast = (imageUrl, title, message) => {
    toastContainer.append(`
    <div class="position-relative bottom-0 right-0 " style="z-index: 5; right: 0; bottom: 0;">
       <div class="toast" id="toast${idCount}" role="alert" aria-live="assertive" aria-atomic="true">
           <div class="toast-header">
           <img src="${imageUrl}" style="max-width: 10%;" class="mr-2">
           <strong class="mr-auto">
               ${title}
           </strong>
           <small>Just Now</small>
           <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
               <span aria-hidden="true">&times;</span>
           </button>
           </div>
           <div class="toast-body">
           ${message}
           </div>
       </div>
   </div>
   `)

    const toast = $(`#toast${idCount}`);
    toast.toast({
        animation: true,
        autohide: false
    });
    toast.toast("show")

    let counter = 0
    const interval = setInterval(() => {
        counter++;
        toast.find("small").text(`${counter} seconds ago`);
        if (counter >= 20) { toast.toast("hide"); clearInterval(interval); }
    }, 1000);
    idCount++;
}

for (key of Object.keys(flashMsg)) {
    for (msg of flashMsg[key]) {
        makeToast(`/images/flash/${key}.png`, key, msg);
    }
}