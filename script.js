//lista de animales, revisar y corregir

const getTasks = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/tasks");
    if (response.ok) {
      const jsonResponse = await response.json();
      return jsonResponse;
    }
  }
  catch (error) {
    console.error(error);
  }
}

let animales = [];

document.addEventListener("DOMContentLoaded", async () => {
  animales = await getTasks();
    mostrarLista(obtenerItems(animales));
    setupDragAndDrop(); // Configurar el drag and drop
    document.getElementById("sort-dropdown").addEventListener("change", ordenarLista);
  });
 
  function ordenarLista() {
    let sortValue = document.getElementById("sort-dropdown").value;
    let sortAnimals = [...animales];
  
    if (sortValue === "price-asc") {
      sortAnimals.sort((a, b) => a.Edad - b.Edad);
    } else if (sortValue === "price-desc") {
      sortAnimals.sort((a, b) => b.Edad - a.Edad);
    }
    
    mostrarLista(obtenerItems(sortAnimals));
    setupDragAndDrop(); // Re-setup del drag and drop después de ordenar
  }
  

//funcion para obtener la sublista filtrada.
function filtrarItems(nombre, descripcion) {
  const nombreMinus = nombre.toLowerCase();
  const descripcionMinus = descripcion.toLowerCase();
  const resultados = animales.filter((animal) => {
    return (
      animal.title.toLowerCase().includes(nombreMinus) ||
      animal.description.toLowerCase().includes(descripcionMinus)
    );
  });

  return resultados.length > 0 ? obtenerItems(resultados) : null;
}

function searchItems() {
  const searchInput = document.getElementById("Text").value.toLowerCase();

  if (searchInput.trim() === "") {
    // Si el input está vacío, mostramos todos los elementos.
    mostrarLista(obtenerItems(animales));
  } else {
    const filteredItems = filtrarItems(searchInput, searchInput);
    mostrarLista(filteredItems);
  }
}

// EventListener al botón "Buscar"
document.getElementById("Buscar").addEventListener("click", searchItems);
document.getElementById("Text").addEventListener("input", searchItems);

// EventListener para que tambien funcione con enter
const searchInputElement = document.getElementById("Text");
searchInputElement.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    searchItems();
  }
});

// mostramos todos los elementos al cargar la página por primera vez
document.addEventListener("DOMContentLoaded", () => {
  mostrarLista(obtenerItems(animales));
});

// Maneja la apertura y cierre del modal
document.getElementById("openModal").addEventListener("click", function () {
  document.getElementById("productModal").classList.add("is-active");
});

document.getElementById("closeModal").addEventListener("click", function () {
  document.getElementById("productModal").classList.remove("is-active");
});

document.getElementById("cancelModal").addEventListener("click", function () {
  document.getElementById("productModal").classList.remove("is-active");
});

// Función para cerrar el modal de detalles de animales
document.getElementById("closeInfoModal").addEventListener("click", function () {
  document.getElementById("infoModal").classList.remove("is-active");
});

// Maneja el guardado del animal
document.getElementById("saveProduct").addEventListener("click", function () {
  const form = document.getElementById("productForm");
  const edadInput = form.querySelector('input[type="number"]');
  const edad = parseFloat(edadInput.value);

  if (form.checkValidity() && edad > 0 && edad <= 100) {
    const nombreProducto = form.querySelector('input[type="text"]').value;
    const descripcionProducto = form.querySelector("textarea").value;
    const imagenForm = form.querySelector('input[type="file"]').files[0];

    const imagenURL = URL.createObjectURL(imagenForm);

    const todo = {
      nombre: nombreProducto,
      descripcion: descripcionProducto,
      imagen: imagenURL,
      Edad: edad,
    };

    animales.push(todo);

    document.getElementById("productModal").classList.remove("is-active");
    mostrarLista(obtenerItems(animales));
    // Limpia el formulario
    form.reset();
  } else {
    // muestra errores si los campos no están llenos o la edad es inválida
    if (edad < 0 || edad > 100) {
      alert("La edad debe ser mayor o igual que 0 y no más de 100 años.");
      edadInput.setCustomValidity("La edad debe ser mayor que 0 y no más de 100 años.");
    } else {
      edadInput.setCustomValidity("");
    }
    form.reportValidity();
  }
});

function obtenerItems(animalLists) {
  return animalLists.map((animal, index) => {
    // let años = animal.Edad == 1 ? `${animal.Edad} año` : `${animal.Edad} años`;
    return `
      <div class="card has-background-warning-light custom-card" id="animal-card-${index}" draggable="true">
        <div class="card-image">
          <figure class="image is-4by3">
            <img class="is-fullwidth fixed" src="./image/${animal.id}.jpeg" alt="${animal.title}" />
          </figure>
        </div>
        <div class="card-content">
          <div class="media">
            <div class="media-content">
              <p class="title is-4">${animal.description}</p>
              <p class="subtitle is-6">inicio de vida: ${animal.startDate}</p>
            </div>
          </div>
          <div class="content">
            ${animal.description}
          </div>
        </div>
      </div>
    `;
  });
}

function mostrarLista(lista) {
  const contentDiv = document.getElementById("content");
  if (contentDiv) {
    contentDiv.innerHTML = "";

    if (lista === null || lista.length === 0) {
      contentDiv.innerHTML = "<p>No hay ningún ítem que cumpla con la búsqueda</p>";
    } else {
      contentDiv.innerHTML = lista.join("");
      setupDragAndDrop();
      setupAnimalCardClicks(); // Buildea ambos setUps
    }
  }
}
  

// muestra a los animales
document.addEventListener("DOMContentLoaded", () => {
  mostrarLista(obtenerItems(animales));
  setupCartDropZone();
});

const dropZone = document.getElementById("drop-zone");
let mensaje = document.getElementById("mensaje");

function setupCartDropZone() {
  const dropZone = document.getElementById("drop-zone");
  let mensaje = document.getElementById("mensaje");

  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    const animalIndex = parseInt(event.dataTransfer.getData("text/plain"));
    const cards = document.querySelectorAll(".card");
    const cardElement = cards[animalIndex];
    
    if (cardElement) {
      const animal = {
        nombre: cardElement.querySelector('.title').textContent,
        Edad: parseFloat(cardElement.querySelector('.subtitle').textContent.split(':')[1]),
        imagen: cardElement.querySelector('img').src,
        descripcion: cardElement.querySelector('.content').textContent.trim()
      };
      
      if (animal) {
        const animalName = animal.title;
        const animalAge = animal.comments[1] == 1 ? "1 año" : `${animal.comments[1]} años`;
        const animalImage = animal.comments[2];
        const animalEntero = `
          <div id="divDe${animalName}" style="display: flex; align-items: center; gap: 10px;">
            <img src="${animalImage}" alt="${animalName}" style="width: 100px; height: 100px; object-fit: cover; border: 3px solid hsl(48, 100%, 67%); border-radius: 50%;">
            <h1 id="mensaje">${animalName} (${animalAge})</h1>
          </div>`;

        if (!dropZone.innerHTML.includes(`id="divDe${animalName}"`)) {
          mensaje.style.display = 'none';
          dropZone.innerHTML += animalEntero + `<br>`;
          dropZone.style.textAlign = 'left';
        }
      }
    }
  });
}

function setupDragAndDrop() {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card, index) => {
    card.setAttribute('data-index', index);
    card.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", card.getAttribute('data-index'));
    });
  });
}


// function setupAnimalCardClicks() {
//   const cards = document.querySelectorAll(".card");
//   cards.forEach((card, index) => {
//     card.addEventListener("click", () => {
//       openAnimalDetailsModal(animales[index]);
//     });
//   });
//}

// function openAnimalDetailsModal(animal) {
//   const modal = document.getElementById("animalDetailsModal");
//   const title = document.getElementById("animalDetailsTitle");
//   const image = document.getElementById("animalDetailsImage");
//   const age = document.getElementById("animalDetailsAge");
//   const description = document.getElementById("animalDetailsDescription");

//   title.textContent = animal.title;
//   image.src = animal.imagen;
//   image.alt = animal.nombre;
//   age.textContent = `Edad: ${animal.Edad == 1 ? '1 año' : animal.Edad + ' años'}`;
//   description.textContent = animal.descripcion;

//   modal.classList.add("is-active");
// }

// Cierra los detalles del animal modal
// document.getElementById("closeAnimalDetailsModal").addEventListener("click", function () {
//   document.getElementById("animalDetailsModal").classList.remove("is-active");
// });

// Función para abrir el modal con información de la mascota
function openInfoModal(animal) {
    const modal = document.getElementById("infoModal");
    const modalContent = document.getElementById("infoModalContent");

    // Actualiza el contenido del modal con la información del animal
    modalContent.innerHTML = `
        <figure class="image is-4by3">
            <img src="image/${animal.id}.jpeg" alt="${animal.title}" />
        </figure>
        <p><strong>Nombre:</strong> ${animal.title}</p>
        <p><strong>Edad:</strong> ${animal.startDate} años</p>
        <p><strong>Descripción:</strong> ${animal.description}</p>
    `;

    modal.classList.add("is-active");
}

// Agregar EventListener a cada card para abrir el modal al hacer clic
function setupCardClick() {
    const cards = document.querySelectorAll(".card");

    cards.forEach((card, index) => {
        card.addEventListener("click", () => {
            openInfoModal(animales[index]);
        });
    });
}

function mostrarLista(lista) {
    const contentDiv = document.getElementById("content");
    if (contentDiv) {
        contentDiv.innerHTML = "";

        if (lista === null || lista.length === 0) {
            contentDiv.innerHTML =
                "<p>No hay ningún ítem que cumpla con la búsqueda</p>";
        } else {
            contentDiv.innerHTML = lista.join("");
            setupDragAndDrop();
            setupCardClick(); 
        }
    }
}