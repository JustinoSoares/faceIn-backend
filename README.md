# API Documentation

## URL_BASE
**https://facein-backend.onrender.com**
## Endpoints

### 1. Create Aluno
**URL:** `/create`

**Method:** `POST`

**Description:** Creates a new Aluno with multiple images.

**Headers:**
- `Content-Type: multipart/form-data`

**Body Parameters:**
- `nome_completo` (string, required): Full name of the student.
- `turno` (string, required): Student's shift.
- `classe` (string, required): Class.
- `n_do_aluno` (string, required): Student number.
- `ano_letivo` (string, required): Academic year.
- `turma` (string, required): Group.
- `curso` (string, required): Course.
- `images` (file[], required): Array of up to 5 images.

**Responses:**
- **201 Created:**
  ```json
  {
    "status": true,
    "msg": "Aluno cadastrado com sucesso",
    "aluno": { ... },
    "fotos": [ ... ]
  }
  ```
- **400 Bad Request:**
  ```json
  {
    "status": false,
    "msg": "Erro ao cadastrar Aluno",
    "error": {
      "msg": "...",
      "error": "..."
    }
  }
  ```

---

### 2. Get All Alunos
**URL:** `/all`

**Method:** `GET`

**Description:** Fetches a paginated list of all students.

**Query Parameters:**
- `maxLen` (integer, optional): Maximum number of students to retrieve (default: 3).
- `offset` (integer, optional): Offset for pagination (default: 0).
- `pesquisa` (string, optional): Search keyword for the student's name.
- `attribute` (string, optional): Attribute to sort by (default: `nome_completo`).
- `order` (string, optional): Sorting order (`ASC` or `DESC`).

**Responses:**
- **201 Success:**
  ```json
  {
    "status": true,
    "msg": "Todos os Alunos",
    "data": [ ... ]
  }
  ```
- **400 Bad Request:**
  ```json
  {
    "status": false,
    "error": [
      {
        "msg": "Erro ao achar os alunos",
        "error": "..."
      }
    ]
  }
  ```

---

### 3. Get Aluno by ID
**URL:** `/:id`

**Method:** `GET`

**Description:** Retrieves a single student by their ID.

**Path Parameters:**
- `id` (integer, required): ID of the student.

**Responses:**
- **201 Success:**
  ```json
  {
    "status": true,
    "data": { ... }
  }
  ```
- **400 Bad Request:**
  ```json
  {
    "error": "Aluno não encontrado"
  }
  ```

---

### 4. Update Aluno
**URL:** `/:id`

**Method:** `PUT`

**Description:** Updates the information of a specific student.

**Path Parameters:**
- `id` (integer, required): ID of the student to update.

**Body Parameters:**
- Any updatable fields of the Aluno.

**Responses:**
- **200 Success:**
  ```json
  {
    "...": "Updated data"
  }
  ```
- **404 Not Found:**
  ```json
  {
    "error": "Aluno não encontrado"
  }
  ```

---

### 5. Delete Aluno
**URL:** `/:id`

**Method:** `DELETE`

**Description:** Deletes a specific student.

**Path Parameters:**
- `id` (integer, required): ID of the student to delete.

**Responses:**
- **204 No Content:**
  ```
  No response body.
  ```
- **404 Not Found:**
  ```json
  {
    "error": "Aluno não encontrado"
  }
  ```

---

### 6. Get Paid Propinas by Aluno ID
**URL:** `/propinas_pagas/:alunoId`

**Method:** `GET`

**Description:** Retrieves the list of paid propinas for a specific student.

**Path Parameters:**
- `alunoId` (integer, required): ID of the student.

**Responses:**
- **200 Success:**
  ```json
  {
    "status": true,
    "proninas": [ ... ]
  }
  ```

---

## Error Responses
- **400 Bad Request:** Occurs when input data is invalid or missing required fields.
- **404 Not Found:** Occurs when a resource (e.g., Aluno) is not found.
- **500 Internal Server Error:** General server error.

---

## Models

### Alunos
- `id` (integer): Primary key.
- `nome_completo` (string): Full name.
- `turno` (string): Shift.
- `classe` (string): Class.
- `n_do_aluno` (string): Student number.
- `ano_letivo` (string): Academic year.
- `turma` (string): Group.
- `curso` (string): Course.
- `n_do_processo` (integer): Process number.

### Fotos
- `id` (integer): Primary key.
- `url` (string): URL of the image.
- `alunoId` (integer): Foreign key referencing Alunos.

### Propinas
- `id` (integer): Primary key.
- `...`: Other fields.

### Aluno_propina
- `id` (integer): Primary key.
- `alunoId` (integer): Foreign key referencing Alunos.
- `propinaId` (integer): Foreign key referencing Propinas.

---

## Endpoints for Vigilante

### 1. Create a Vigilante
**POST** `/create`

- **Description**: Creates a new vigilante (security guard) and associates them with a user. The user's password is generated randomly.
- **Request Body**:
  - `nome_completo` (string) - Full name of the vigilante
  - `telefone` (string) - Phone number of the vigilante
  - `email` (string) - Email of the vigilante
  - `turno` (string) - Shift of the vigilante (e.g., morning, night)
  - `desc` (string) - Description or additional information about the vigilante
- **Response**:
  - **201** (Created)
    ```json
    {
      "status": true,
      "msg": "Vigilante criado com sucesso",
      "data": {
        "nome_completo": "Vigilante Name",
        "telefone": "1234567890",
        "email": "vigilante@example.com",
        "turno": "Morning",
        "desc": "Security Guard Description"
      }
    }
    ```
  - **400** (Bad Request)
    ```json
    {
      "status": false,
      "error": [
        {
          "msg": "Esse vigilante já existe"
        }
      ]
    }
    ```

---

### 2. Get All Vigilantes
**GET** `/all`

- **Description**: Retrieves all vigilantes.
- **Response**:
  - **200** (Success)
    ```json
    {
      "status": true,
      "data": [
        {
          "id": 1,
          "nome_completo": "Vigilante 1",
          "turno": "Morning",
          "desc": "Description"
        },
        {
          "id": 2,
          "nome_completo": "Vigilante 2",
          "turno": "Night",
          "desc": "Description"
        }
      ]
    }
    ```
  - **400** (Bad Request)
    ```json
    {
      "status": false,
      "error": "Erro ao buscar vigilantes"
    }
    ```

---

### 3. Get a Vigilante by ID
**GET** `/each/:id`

- **Description**: Retrieves a specific vigilante by their ID.
- **Path Parameters**:
  - `id` (integer) - Vigilante ID
- **Response**:
  - **200** (Success)
    ```json
    {
      "status": true,
      "data": {
        "id": 1,
        "nome_completo": "Vigilante Name",
        "turno": "Morning",
        "desc": "Description"
      }
    }
    ```
  - **400** (Not Found)
    ```json
    {
      "status": false,
      "error": "Vigilante não encontrado"
    }
    ```

---

### 4. Update a Vigilante
**PUT** `/update/:id`

- **Description**: Updates the details of an existing vigilante.
- **Path Parameters**:
  - `id` (integer) - Vigilante ID
- **Request Body**:
  - Partial or full data to update (e.g., `nome_completo`, `turno`, `desc`)
- **Response**:
  - **200** (Success)
    ```json
    {
      "status": true,
      "data": {
        "id": 1,
        "nome_completo": "Updated Vigilante",
        "turno": "Night",
        "desc": "Updated Description"
      }
    }
    ```
  - **404** (Not Found)
    ```json
    {
      "status": false,
      "error": "Vigilante não encontrado"
    }
    ```

---

### 5. Delete a Vigilante
**DELETE** `/delete/:id`

- **Description**: Deletes a vigilante by their ID.
- **Path Parameters**:
  - `id` (integer) - Vigilante ID
- **Response**:
  - **200** (Success)
  - **404** (Not Found)
    ```json
    {
      "status": false,
      "error": "Vigilante não encontrado"
    }
    ```

---

### 6. Permit a Student Entry
**POST** `/permitir/:alunoId`

- **Description**: Allows entry for a specific student.
- **Path Parameters**:
  - `alunoId` (integer) - Student ID
- **Response**:
  - **200** (Success)
    ```json
    {
      "status": true,
      "msg": "Entrada permitida para o aluno"
    }
    ```
  - **400** (Bad Request)
    ```json
    {
      "status": false,
      "error": "Erro ao permitir entrada"
    }
    ```

---

### 7. Deny a Student Entry
**POST** `/negar/:alunoId`

- **Description**: Denies entry for a specific student.
- **Path Parameters**:
  - `alunoId` (integer) - Student ID
- **Response**:
  - **200** (Success)
    ```json
    {
      "status": true,
      "msg": "Entrada negada para o aluno"
    }
    ```
  - **400** (Bad Request)
    ```json
    {
      "status": false,
      "error": "Erro ao negar entrada"
    }
    ```

---

### 8. Recognize a Student
**GET** `/reconhecimento/:alunoId`

- **Description**: Recognizes a specific student.
- **Path Parameters**:
  - `alunoId` (integer) - Student ID
- **Response**:
  - **200** (Success)
    ```json
    {
      "status": true,
      "msg": "Aluno reconhecido"
    }
    ```

---

### 9. Pay Tuition Fees for a Student
**POST** `/pagar_propina/:alunoId`

- **Description**: Marks tuition fees as paid for a specific student.
- **Path Parameters**:
  - `alunoId` (integer) - Student ID
- **Response**:
  - **200** (Success)
    ```json
    {
      "status": true,
      "msg": "Propina paga para o aluno"
    }
    ```
  - **400** (Bad Request)
    ```json
    {
      "status": false,
      "error": "Erro ao pagar propina"
    }
    ```

---
### 9. Histories
**POST** `/historico/`
- **Request Query**:
  - `limit` (string) - limit of each page
  - `lastPage` (string) - last page
  - `order` (string) - Order of data cames
  - `atribute` (string) - Atribute that is order
 
    
  - **200** (Success)
    ```json
    {
      "status": true,
      "is_lastPages" : false,
      "alunosLength": 1000,
      "vigilanteLength": 1000,
      "historico" : {
         "alunoId": ...,
          "nome_completo": ...,
          "timestamp": ...,
          "img": ...,
          "status": ...,
          "createdAt": ...,
          "lastPage": ...,
      }
    }
    ```

---

## Error Handling
- **400** - Bad Request: Invalid or missing data in the request.
- **404** - Not Found: Resource not found.
- **500** - Internal Server Error: An unexpected error occurred on the server.

---

## Notes
1. **Authentication**: Some routes, such as permitting or denying student entry, are restricted to vigilantes. These routes require authentication via the `auth.vigilante` middleware.
2. **Bcrypt**: User passwords are hashed using `bcrypt` before being stored in the database for security purposes.
3. **Random PIN Generation**: A random PIN is generated for each vigilante and used as their initial password before being hashed and stored.

---


## Notes
- Images are uploaded to Cloudinary, and local files are deleted after upload.
- Minimum of 3 images is required for each Aluno.
- Supports pagination and search functionality for listing students.
- Proper error handling and validation are implemented in routes.
