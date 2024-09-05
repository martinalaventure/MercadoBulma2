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

// funsion que carga la funcion asincrona getTasks y permite su utilizacion de la lista que responde de forma local
const loadTasks = async () => {
    const tasks = await getTasks();
    showTasks(tasks);
  }

// Mostrar tareas, funcion a la que se le pasa una lista en formato JSON y la imprime en el HTML

const showTasks = (tasks) => {
    const tasksList = document.getElementById("tasksList");
    tasksList.innerHTML = "";
    tasks.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.innerHTML = `
        <div class="card has-background-warning-light custom-card" data-index="${index}" draggable="true">
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-4">${task.title}</p>
                <p class="subtitle is-6">Estado: ${task.status}</p>
              </div>
            </div>
            <div class="content">
              ${task.description}
            </div>
          </div>
        </div>
      `;
        tasksList.appendChild(taskElement);
    }
    );
    }