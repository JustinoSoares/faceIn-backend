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

## Notes
- Images are uploaded to Cloudinary, and local files are deleted after upload.
- Minimum of 3 images is required for each Aluno.
- Supports pagination and search functionality for listing students.
- Proper error handling and validation are implemented in routes.
