/**
 * @jest-environment jsdom
 */

 import {screen, waitFor} from "@testing-library/dom"
 import userEvent from '@testing-library/user-event'
 import BillsUI from "../views/BillsUI.js";
 import { bills } from "../fixtures/bills.js";
 import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
 import {localStorageMock} from "../__mocks__/localStorage.js";
 import Bills from "../containers/Bills.js";
 import store from "../__mocks__/store";
 import mockStore from "../__mocks__/store"
 import router from "../app/Router.js";
 
 jest.mock("../app/store", () => mockStore)
 
 //Test permettant de savoir si l'icone en forme de lettre est mise en avant
 describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
      test("Then bill icon in vertical layout should be highlighted", async () => {
        
        //Initialisation & routes
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)

        //Récupération de l'icone
        await waitFor(() => screen.getByTestId('icon-window'))
        const windowIcon = screen.getByTestId('icon-window')
        
        //Expression permattant le test
        expect(windowIcon).not.toBeNull();
        expect(windowIcon.classList.contains('active-icon')).toBe(true);
      })

      //Test permettant de savoir si les dates sont triées par ordre decroissant
      test("Then bills should be ordered from earliest to latest", () => {
        document.body.innerHTML = BillsUI({ data: bills })
        const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
        const antiChrono = (a, b) => ((a < b) ? 1 : -1)
        const datesSorted = [...dates].sort(antiChrono)
        expect(dates).toEqual(datesSorted)
      })


      //Permet de tester le comportement du site lorsque l'on clique sur le bouton new bill
      test("Then, when I click on the new bill button the page to create a bill is loaded", () => {   
        
        //init & routes 
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }));
        document.body.innerHTML = BillsUI({ data: bills });
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        }
        const store = null;
        const newBills = new Bills({
          document, onNavigate, store, localStorage: window.localStorage
        });

        //Récupération de données
        const handleClickNewBill = jest.fn(newBills.handleClickNewBill);
        const newBillBtn = screen.getByTestId("btn-new-bill"); 
        newBillBtn.addEventListener('click', handleClickNewBill);

        //Simulation du clique par un utilisateur
        userEvent.click(newBillBtn);
        
        //La fonction doit être appelée
        expect(handleClickNewBill).toHaveBeenCalled();

        //Le formulaire doit s'afficher
        const form = screen.getByTestId('form-new-bill');
        expect(form).toBeTruthy();
      })


      //Permet de tester l'appel de la fonction permettant de gérer la modale lors d'un clic sur l'icone en forme d'oeil
      test('Then I click on the icon eye and a function to show the modal should be called', () => {
        
        //Init & routes
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }));
        document.body.innerHTML = BillsUI({ data: bills });
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        }
        const store = null;
        const newBills = new Bills({
          document, onNavigate, store, localStorage: window.localStorage
        });
  
        //Mock la .modal()
        $.fn.modal = jest.fn();
        
        //Récupération
        const eyeBtn = document.querySelector("#eye");
        const handleClickIconEye = jest.fn(newBills.handleClickIconEye(eyeBtn));
        eyeBtn.addEventListener('click', handleClickIconEye);
        userEvent.click(eyeBtn);
        
        //La fonction doit être appelée
        expect(handleClickIconEye).toHaveBeenCalled();
      })


      //Permet de tester l'ouverture de la modale lors d'un clic sur l'icone en forme d'oeil
      test('Then I click on the icon eye and a modal should open', async () => {
        
        //init & routes
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
          }))
          document.body.innerHTML = BillsUI({data: bills})
          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
          }
          const store = null
          const newBills = new Bills({
            document, onNavigate, store, bills, localStorage: window.localStorage
          })
          
          //Mock the .modal()
          $.fn.modal = jest.fn();
          
          //Récupération
          let modale = document.getElementsByClassName('modal-body');
          let value;
    
          //Test s'il y a une image affichée ou non grâce aux enfant (html)
          if(typeof modale[0].childNodes[0].childNodes[0] === "undefined")
          {
            //S'il n'y a pas de child, alors aucune image n'est affichée dans la modale
            value = null;
          }
          else
          {
            value = modale[0].childNodes[0].childNodes[0].src;
          }
    
          //Dans un premier temps, la modale doit être vide. Ensuite lorsque l'on clique sur l'icone alors l'image s'affiche.
          expect(value).toBeNull();
    
          //Execution & récupération
          const handleClickIconEye = newBills.handleClickIconEye
          const eye = screen.getAllByTestId('icon-eye')
          eye[1].addEventListener('click', handleClickIconEye(eye[1]))
          userEvent.click(eye[1])
    
          modale = document.getElementsByClassName('modal-body');
          
          //Valeur par defaut dans les valeurs de test
          let ExpectFileUrl = "https://test.storage.tld/v0/b/billable-677b6.a…dur.png?alt=media&token=571d34cb-9c8f-430a-af52-66221cae1da3";
          //Valeur récupéré
          let uriDecodeTestLink = decodeURI(modale[0].childNodes[0].childNodes[0].src)  
    
          //Le lien doit exister et correspondre au fichier de test (store)
          expect(uriDecodeTestLink).not.toBeNull();
          expect(uriDecodeTestLink).toBe(ExpectFileUrl);
      })
    })
 })
 
// test d'intégration GET
//Test la récupération des notes de frais
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to bills page", () => {
    test("fetches bills from mock API GET", async () => {  

      //init & routes
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      const newBills = new Bills({document, onNavigate, store, localStorage: window.localStorage});
      const billsFetched = await newBills.getBills();

      //Le nombre total de bills soit être de 4 (via le store)
      expect(billsFetched.length).toEqual(4);
    })

    //Test des erreurs 404 & 500
    describe("When an error occurs on API", () => {
      //Init 
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}));
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })

      //Erreur 404
      test("fetches bills from an API and fails with 404 message error", async () => {

        //Permet de renvoyer une erreur lors du fetch
        mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})

        //Routes
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);

        //Récupération du message d'erreur
        const errorMsg = screen.getByTestId('error-message');

        //Le message doit exister
        expect(errorMsg).toBeTruthy()

        //Le message doit contenir le terme Erreur 404
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      //Erreur 500
      test("fetches messages from an API and fails with 500 message error", async () => {

        //Retourne une reeur 500 lors du fetch
        mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

        //Routes
        window.onNavigate(ROUTES_PATH.Bills)
        await new Promise(process.nextTick);

        //Récupération du message d'erreur
        const errorMsg = screen.getByTestId('error-message');

        //Le message doit exister
        expect(errorMsg).toBeTruthy()

        //Le message doit contenir le terme Erreur 500
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })
  })
})