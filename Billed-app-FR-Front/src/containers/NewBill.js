import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault()

    this.removeAnError(this.document.querySelector(`input[data-testid="file"]`));

    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]
    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)

    //Récupération de l'extention
    const fileType = file['type'].split("/")[0];
    const fileExt = file['type'].split("/")[1];

    //Vérification de l'extension
    const ExtSupported = ["jpg", "jpeg", "png"];

    if(ExtSupported.includes(fileExt) && fileType === "image")
    {
      //Attention aux insertions null
      this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        console.log(fileUrl)
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => console.error(error))
    }
    else
    {
      this.triggerAnError(this.document.querySelector(`input[data-testid="file"]`));
    }
  }

  //Function to generate an error under an input
  triggerAnError(input)
  {
      const parentNode = input.parentNode;

      //Vérification de l'existance d'un message d'erreur
      const errorMsg = parentNode.getElementsByClassName("errorMessage");
      const checkIfErrorExist = document.body.contains(errorMsg[0]);

      if(checkIfErrorExist == false)
      {
        const errorDOM = document.createElement("p");
        errorDOM.classList.add("errorMessage");
        errorDOM.textContent = "L'extension de votre fichier n'est pas supportée. Seuls les fichiers JPG, JPEG et PNG sont acceptés.";
        parentNode.appendChild(errorDOM);
      }

      input.classList.remove("blue-border");

      input.style.border = "2px solid red";
      input.value = "";
  }

  //Function to remove an error under an input
  removeAnError(input)
  {
    input.classList.add("blue-border");
    const parentNode = input.parentNode;
    const errorMsg = parentNode.getElementsByClassName("errorMessage");
    if(errorMsg.length > 0)
    {
      parentNode.removeChild(errorMsg[0]);
    }
  }



  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    console.log(bill);
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}