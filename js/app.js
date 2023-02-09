document.addEventListener('DOMContentLoaded', () => {

  const arrayInvitados = [];
  class Invitado  {
    constructor(){
      this.id;
      this.nombre;
      this.confirmado;
    }
    };

  const form = document.getElementById('registrar');
  const input = form.querySelector('input');
  
  const mainDiv = document.querySelector('.main');
  const ul = document.getElementById('invitedList');
  
  const div = document.createElement('div');
  const filterLabel = document.createElement('label');
  const filterCheckBox = document.createElement('input');
  
  filterLabel.textContent = "Ocultar los que no hayan respondido";
  filterCheckBox.type = 'checkbox';
  div.appendChild(filterLabel);
  div.appendChild(filterCheckBox);
  mainDiv.insertBefore(div, ul);

  filterCheckBox.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    const lis = ul.children;
    if(isChecked) {
      for (let i = 0; i < lis.length; i += 1) {
        let li = lis[i];
        if (li.className === 'responded') {
          li.style.display = '';  
        } else {
          li.style.display = 'none';                        
        }
      }
    } else {
      for (let i = 0; i < lis.length; i += 1) {
        let li = lis[i];
        li.style.display = '';
      }                                 
    }
  });
  
  function createLI(text) {
    function createElement(elementName, property, value) {
      const element = document.createElement(elementName);  
      element[property] = value; 
      return element;
    }
    
    function appendToLI(elementName, property, value) {
      const element = createElement(elementName, property, value);     
      li.appendChild(element); 
      return element;
    }
    
    const li = document.createElement('li');
    appendToLI('span', 'textContent', text);     
    appendToLI('label', 'textContent', 'Confirmed')
      .appendChild(createElement('input', 'type', 'checkbox'));
    appendToLI('button', 'textContent', 'edit');
    appendToLI('button', 'textContent', 'remove');
    return li;
  }
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    var invitado = new Invitado();
    const text = input.value;
    input.value = '';
    const li = createLI(text);
    var idNueva = crearId();
    invitado.id = idNueva;
    invitado.nombre = text;
    invitado.confirmado = false;
    arrayInvitados.push(invitado);
    li.setAttribute("id",idNueva);
    ul.appendChild(li);
    escribirJson();
    console.log(arrayInvitados)
  });
    
  ul.addEventListener('change', (e) => {
    const checkbox = e.target;
    const checked = checkbox.checked;
    const listItem = checkbox.parentNode.parentNode;
    
    if (checked) {
      listItem.className = 'responded';
      var idC = checkbox.parentElement.parentElement.getAttribute("id");
      arrayInvitados[idC-1].confirmado = true;
      cambiosJson(idC);

    } else {
      listItem.className = '';
    }
  });
    
  ul.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const button = e.target;
      const li = button.parentNode;
      const ul = li.parentNode;
      const action = button.textContent;
      const nameActions = {
        remove: () => {
          ul.removeChild(li);
          var idB = e.target.parentNode.getAttribute("id");
          borrarJson(idB);
        },
        edit: () => {
          const span = li.firstElementChild;
          const input = document.createElement('input');
          input.type = 'text';
          input.value = span.textContent;
          li.insertBefore(input, span);
          li.removeChild(span);
          button.textContent = 'save';  
        },
        save: () => {
          const input = li.firstElementChild;
          var idLi = input.parentElement.getAttribute("id");
          const span = document.createElement('span');
          span.textContent = input.value;
          li.insertBefore(span, input);
          li.removeChild(input);
          button.textContent = 'edit';
          arrayInvitados[idLi-1].nombre = input.value;
          cambiosJson(idLi);      
        }
      };
      
      // select and run action in button's name
      nameActions[action]();
    }
  });
  
  const postGet = "http://localhost:3000/invitados";

  async function request(url) {
     
    return await new Promise(async function (resolve, reject) {
      const xhr =  new XMLHttpRequest();
      xhr.timeout = 2000;
      xhr.onreadystatechange = function(e) {
        if (xhr.readyState === 4) {
              console.log(xhr.status);
          if (xhr.status === 200) {
            resolve(xhr.response)
          } else {
           
            reject(xhr.status)
          
          }
        }
      }
      xhr.ontimeout = function () {
        reject('timeout')
      }
      xhr.open('get', url, true)
      xhr.send();
    })
  
  }
  
  const myPromise = request(postGet)
  
  console.log('will be pending when logged', myPromise)

  myPromise
    .then( function imprimirPosts(json) {
      const listPosts = JSON.parse(json);
      for (let i = 0; i < listPosts.length; i++) {
        var invitado = new Invitado();
        invitado.id = listPosts[i].id;
        invitado.nombre = listPosts[i].nombre;
        invitado.confirmado = listPosts[i].confirmado;
        const li = createLI(listPosts[i].nombre);
        li.setAttribute("id",listPosts[i].id);
        if(listPosts[i].confirmado == true){
         var checkbox = li.firstElementChild.nextElementSibling.firstElementChild;
         checkbox.checked = true;
         li.classList = "responded";
        }
        ul.appendChild(li);
        arrayInvitados.push(invitado);
      }    
  
    })
    .catch(function handleErrors(error) {
      console.log('when a reject is executed it will come here ignoring the then statement ', error)
    })

    function escribirJson(){
      var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 
      var theUrl = "http://localhost:3000/invitados";
      xmlhttp.open("POST", theUrl);
      xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xmlhttp.send(JSON.stringify(arrayInvitados[arrayInvitados.length-1]));
    }

    function crearId(){
      return Number( ul.lastElementChild.getAttribute("id"))+1;
      
    }
    function cambiosJson(id) {
     var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 

     var theUrlC = "http://localhost:3000/invitados/" + id;
     xmlhttp.open("PATCH", theUrlC);
     xmlhttp.setRequestHeader("Content-Type", "application/json");
     console.log(arrayInvitados[id-1]);
     xmlhttp.send(JSON.stringify(arrayInvitados[id-1]));
    }
    function borrarJson(id) {
      var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 

      var theUrlC = "http://localhost:3000/invitados/" + id;
      xmlhttp.open("DELETE", theUrlC);
      xmlhttp.setRequestHeader("Content-Type", "application/json");
      xmlhttp.send(null);
    }
  



  
});  
  
  
  
  
  
  
  
  
  