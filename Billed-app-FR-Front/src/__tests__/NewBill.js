/**
 * @jest-environment jsdom
 */

import {screen, waitFor, fireEvent} from "@testing-library/dom";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import store from "../__mocks__/store";
import {ROUTES_PATH} from "../constants/routes.js";
import NewBill from "../containers/NewBill.js";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then new bill icon in vertical layout should be highlighted", async () => {
      //initialisation
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      //html
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      //route
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      //récupération et test
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon).not.toBeNull();
      expect(mailIcon.classList.contains('active-icon')).toBe(true);
    })
  })
  describe("When I am on the form to create a new bill", () => {
    test("Then I fill the field concerning the image with a correct file, so the name of the image should be displayed", () => {
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
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      const input = screen.getByTestId("file");
      input.addEventListener("change", handleChangeFile);
      fireEvent.change(input, {
        target: {
          files: [
            new File(["image.png"], "image.png", { type: "image/png" }),
          ],
        },
      });
      expect(handleChangeFile).toHaveBeenCalled();
      expect(input.files[0].name).toBe("image.png");
    })
    test("Then I fill the field concerning the image with a incorrect file, so an error should be displayed", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
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
      expect(errorMessage).not.toBeNull();
      expect(errorMessage).toBe("L'extension de votre fichier n'est pas supportée. Seuls les fichiers JPG, JPEG et PNG sont acceptés.")
    })
    test("when an error is displayed, the message must not be duplicated", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
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
      expect(countErrorMessage).not.toBeNull();
      expect(countErrorMessage).toBe(1);
    })
  })
})
