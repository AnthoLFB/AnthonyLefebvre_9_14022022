/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import store from "../__mocks__/store";
import {ROUTES_PATH} from "../constants/routes"
import NewBill from "../containers/NewBill.js";
import userEvent from '@testing-library/user-event'

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    
    //Test l'affichage de l'icone
    test("Then new bill icon in vertical layout should be highlighted", async () => {
      
      //initialisation & routes
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      //récupération et test
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')

      //L'icone doit exister et être mise en avant
      expect(mailIcon).not.toBeNull();
      expect(mailIcon.classList.contains('active-icon')).toBe(true);
    })
  })
  
  describe("When I am on the form to create a new bill", () => {
    
    //Teste le champ image du formulaire
    test("Then I fill the field concerning the image with a correct file, so the name of the image should be displayed", () => {
      
      //init & routes
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      const newBill = new NewBill({document, onNavigate, store, localStorage});

      //Récupération
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      const input = screen.getByTestId("file");
      input.addEventListener("change", handleChangeFile);

      //Simule le fait de mettre une image dans le champ 
      fireEvent.change(input, {
        target: {
          files: [
            new File(["image.png"], "image.png", { type: "image/png" }),
          ],
        },
      });

      //La fonction doit être appelée
      expect(handleChangeFile).toHaveBeenCalled();
      expect(input.files[0].name).toBe("image.png");
    })

    //Test l'affichage d'un message d'erreur en cas de mauvais fichier rentré
    test("Then I fill the field concerning the image with a incorrect file, so an error should be displayed", () => {

      //init & routes
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      //Récupération et remplissage du champ
      const input = screen.getByTestId('file');
      fireEvent.change(input, {
        target: {
          files: [
            new File(["test"], "test.txt", { type: "text/plain" }),
          ],
        },
      });
      let error = document.getElementsByClassName("errorMessage");
      let errorMessage = error[0].textContent;

      //Le message d'erreur doit exister et correspondre au texte
      expect(errorMessage).not.toBeNull();
      expect(errorMessage).toBe("L'extension de votre fichier n'est pas supportée. Seuls les fichiers JPG, JPEG et PNG sont acceptés.")
    })

    //Test la duplication des messages d'erreurs
    test("when an error is displayed, the message must not be duplicated", () => {
      
      //Init
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      //Récupération & remplissage
      const input = screen.getByTestId('file');
      fireEvent.change(input, {
        target: {
          files: [
            new File(["test"], "test.txt", { type: "text/plain" }),
          ],
        },
      });
      fireEvent.change(input, {
        target: {
          files: [
            new File(["test2"], "test2.txt", { type: "text/plain" }),
          ],
        },
      });
      fireEvent.change(input, {
        target: {
          files: [
            new File(["test3"], "test3.txt", { type: "text/plain" }),
          ],
        },
      });
      let error = document.getElementsByClassName("errorMessage");
      let countErrorMessage = error.length;

      //Le message d'erreur doit exister et le nombre ne doit pas être > à 1
      expect(countErrorMessage).not.toBeNull();
      expect(countErrorMessage).toBe(1);
    })
  })
})

//Test la création d'une note de frais
describe('Given I am a user connected as Employee', () => {
  describe("When I submit the form completed", () => {
    test("Then the bill is created", async () => {

      //init & routes
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      const newBill = new NewBill({document, onNavigate, store: null, localStorage: window.localStorage})

      //Création d'une fausse note de frais
      const prototypeBill = {
          type: "Restaurants et bars",
          name: "Restaurant test",
          date: "2022-02-26",
          amount: 145,
          vat: 70,
          pct: 30,
          commentary: "Test form",
          fileUrl: "test.jpg",
          fileName: "test.jpg",
          status: "pending"
      };

      //Remplissage des différents champs
      screen.getByTestId("expense-type").value = prototypeBill.type;
      screen.getByTestId("expense-name").value = prototypeBill.name;
      screen.getByTestId("datepicker").value = prototypeBill.date;
      screen.getByTestId("amount").value = prototypeBill.amount;
      screen.getByTestId("vat").value = prototypeBill.vat;
      screen.getByTestId("pct").value = prototypeBill.pct;
      screen.getByTestId("commentary").value = prototypeBill.commentary;
      
      newBill.updateBill = jest.fn();

      //Récupération du btn et simulation du clique
      let test = document.getElementById("btn-send-bill")
      userEvent.click(test)
      
      //La fonction updateBill doit être appelée si une bill est créée. Lorsque updateBill est appelée alors createBill aussi.
      expect(newBill.updateBill).toHaveBeenCalled()
    })
  })
})