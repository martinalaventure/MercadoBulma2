
document.addEventListener("DOMContentLoaded", async () => {
  await getAnimals();
  setupDragAndDrop();
  setupCartDropZone();
  document.getElementById("sort-dropdown").addEventListener("change", ordenarLista);
  document.getElementById("Buscar").addEventListener("click", searchItems);
});

function setupDragAndDrop() {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card, index) => {
    card.setAttribute('data-index', index);
    card.setAttribute('draggable', true);
    card.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", card.getAttribute('data-index'));
    });
  });
}


function setupCartDropZone() {
  const dropZone = document.getElementById("drop-zone");
  let mensaje = document.getElementById("mensaje");

  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    const index = parseInt(event.dataTransfer.getData("text/plain"));
    const cards = document.querySelectorAll(".card");
    const cardElement = cards[index];

    if (cardElement) {
      const product = {
        name: cardElement.querySelector('.title').textContent,
        price: parseFloat(cardElement.querySelector('.subtitle').textContent.split(':')[1]),
        image: cardElement.querySelector('img').src,
        description: cardElement.querySelector('.content').textContent.trim()
      };

      if (product){
        const productHTML = `
        <div id="divDe${product.name}" style="display: flex; align-items: center; gap: 10px;">
          <img src="${product.image}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 50%;">
          <h1 id="mensaje">${product.name} ($${product.price})</h1>
        </div>
        `;

        if (!dropZone.innerHTML.includes(`id="divDe${product.name}"`)) {
          mensaje.style.display = 'none'; // Oculta el mensaje por defecto
          dropZone.innerHTML += productHTML + `<br>`;
          dropZone.style.textAlign = 'left'; // Ajusta el estilo de la zona de drop
        }
      }      
    }
  });
}

function openInfoModal(cardElement) {
  const modal = document.getElementById("infoModal");
  const modalContent = document.getElementById("infoModalContent");

  const name = cardElement.querySelector('.title').textContent;
  const price = cardElement.querySelector('.subtitle').textContent;
  const description = cardElement.querySelector('.content').textContent;
  const image = cardElement.querySelector('img').src;

  modalContent.innerHTML = `
    <figure class="image is-4by3">
      <img src="${image}" alt="${name}" />
    </figure>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Price:</strong> ${price}</p>
    <p><strong>Description:</strong> ${description}</p>
  `;

  modal.classList.add("is-active");
}

// Obtener productos del backend
async function getAnimals() {
  try {
    const response = await fetch("http://localhost:3000/api/products");
    const products = await response.json();
    mostrarLista(obtenerItems(products)); // Usar la función para mostrar productos
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

function searchItems() {
  const searchInput = document.getElementById("Text").value.toLowerCase();

  if (searchInput.trim() === "") {
      getAnimals();
  } else {
      fetch("http://localhost:3000/api/products")
        .then(response => response.json())
        .then(products => {
          const filteredProducts = products.filter((product) => 
              product.name.toLowerCase().includes(searchInput) ||
              product.description.toLowerCase().includes(searchInput)
          );
          mostrarLista(obtenerItems(filteredProducts));
        })
        .catch(error => console.error('Error:', error));
  }
}

function ordenarLista() {
  let sortValue = document.getElementById("sort-dropdown").value;
  
  fetch("http://localhost:3000/api/products")
    .then(response => response.json())
    .then(products => {
      let sortedProducts = [...products];

      if (sortValue === "price-asc") {
          sortedProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      } else if (sortValue === "price-desc") {
          sortedProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      }

      mostrarLista(obtenerItems(sortedProducts));
    })
    .catch(error => console.error('Error:', error));
}

document.getElementById("saveProduct").addEventListener("click", async function () {
  const form = document.getElementById("productForm");
  const nombreProducto = form.querySelector('input[type="text"]').value;
  const descripcionProducto = form.querySelector("textarea").value;
  const edadInput = form.querySelector('input[type="number"]');
  const edad = parseFloat(edadInput.value);
  const imagenForm = form.querySelector('input[type="file"]').files[0];

  if (form.checkValidity()) {
    const imagenURL = URL.createObjectURL(imagenForm);

    const nuevoProducto = {
      name: nombreProducto,
      description: descripcionProducto,
      price: edad.toString(),
      image: imagenURL
    };

    try {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoProducto),
      });

      if (response.ok) {
        getAnimals(); // Refresca la lista de productos
        form.reset(); // Limpia el formulario
        document.getElementById("productModal").classList.remove("is-active"); // Cierra el modal
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  }
});

function obtenerItems(productList) {
  return productList.map((product) => {
    return `
      <div class="card has-background-warning-dark custom-card" data-id="${product.id}" draggable="true">
        <div class="card-image">
          <figure class="image is-4by3">
            <img class="is-fullwidth fixed" src="${product.image}" alt="${product.name}" />
          </figure>
        </div>
        <div class="card-content">
          <div class="media">
            <div class="media-content">
              <p class="title is-4">${product.name}</p>
              <p class="subtitle is-6">Precio: $${product.price}</p>
            </div>
          </div>
          <div class="content">${product.description}</div>
          <button class="button is-danger" onclick="deleteProduct(event, '${product.id}')">Eliminar</button>
        </div>
      </div>
    `;
  }).join("");
}

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

/*
document.addEventListener("DOMContentLoaded", async () => {
  await getAnimals();
  setupDragAndDrop();
  document.getElementById("sort-dropdown").addEventListener("change", ordenarLista);
  document.getElementById("Buscar").addEventListener("click", searchItems);
});
*/
function mostrarLista(lista) {
  const contentDiv = document.getElementById("content");
  if (contentDiv) {
      contentDiv.innerHTML = "";

      if (lista === null || lista.length === 0) {
          contentDiv.innerHTML = "<p>No hay ningún ítem que cumpla con la búsqueda</p>";
      } else {
          contentDiv.innerHTML = lista;
          setupDragAndDrop();
          setupAnimalCardClicks();
      }
  }
}

async function deleteProduct(event, id) {
  event.stopPropagation();
  try {
    const response = await fetch(`http://localhost:3000/api/products/${id}`, { method: 'DELETE' });

    if (response.ok) {
      getAnimals(); // Refresca la lista de productos
    }
  } catch (error) {
    console.error('Error deleting product:', error);
  }
}

function setupAnimalCardClicks() {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
      card.addEventListener("click", () => {
          const productId = card.getAttribute('data-id');
          openInfoModal(card);
      });
  });
}
/*
//funcion para obtener la sublista filtrada.
function filtrarItems(nombre, descripcion) {
  const nombreMinus = nombre.toLowerCase();
  const descripcionMinus = descripcion.toLowerCase();
  const resultados = animales.filter((animal) => {
    return (
      animal.nombre.toLowerCase().includes(nombreMinus) ||
      animal.descripcion.toLowerCase().includes(descripcionMinus)
    );
  });

  return resultados.length > 0 ? obtenerItems(resultados) : null;
}



// mostramos todos los elementos al cargar la página por primera vez
document.addEventListener("DOMContentLoaded", () => {
  mostrarLista(obtenerItems(animales));
});



function obtenerItems(animalLists) {
    return animalLists.map((animal, index) => {
        let años = animal.Edad == 1 ? `${animal.Edad} año` : `${animal.Edad} años`;
        return `
        <div class="card has-background-warning-light custom-card" data-index="${index}" draggable="true">
          <div class="card-image">
            <figure class="image is-4by3">
              <img class="is-fullwidth fixed" src="${animal.imagen}" alt="${animal.nombre}" />
            </figure>
          </div>
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-4">${animal.nombre}</p>
                <p class="subtitle is-6">Edad: ${años}</p>
              </div>
            </div>
            <div class="content">
              ${animal.descripcion}
            </div>
          </div>
        </div>
      `;
    });
}

// muestra a los animales
document.addEventListener("DOMContentLoaded", () => {
  mostrarLista(obtenerItems(animales));
  setupCartDropZone();
});

// Muestra todos los elementos al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  mostrarLista(obtenerItems(animales));
  setupDragAndDrop(); // Configura el drag and drop
});



function openAnimalDetailsModal(animal) {
  const modal = document.getElementById("animalDetailsModal");
  const title = document.getElementById("animalDetailsTitle");
  const image = document.getElementById("animalDetailsImage");
  const age = document.getElementById("animalDetailsAge");
  const description = document.getElementById("animalDetailsDescription");

  title.textContent = animal.nombre;
  image.src = animal.imagen;
  image.alt = animal.nombre;
  age.textContent = `Edad: ${animal.Edad == 1 ? '1 año' : animal.Edad + ' años'}`;
  description.textContent = animal.descripcion;

  modal.classList.add("is-active");
}

// Cierra los detalles del animal modal
document.getElementById("closeAnimalDetailsModal").addEventListener("click", function () {
  document.getElementById("animalDetailsModal").classList.remove("is-active");
});



// Agregar EventListener a cada card para abrir el modal al hacer clic
function setupCardClick() {
    const cards = document.querySelectorAll(".card");

    cards.forEach((card, index) => {
        card.addEventListener("click", () => {
            openInfoModal(animales[index]);
        });
    });
}



document.addEventListener("DOMContentLoaded", () => {
    mostrarLista(obtenerItems(animales));
    setupDragAndDrop();
    document.getElementById("sort-dropdown").addEventListener("change", ordenarLista);
});
*/