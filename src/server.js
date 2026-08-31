import "dotenv/config";

import express from "express";

import cors from "cors";

import {
  conectarBanco,
  livrosCollection
} from "./db.js";

const app = express();

app.use(cors());

app.use(express.json());


// GET /api/livros
app.get("/api/livros", async (_req, res) => {
  try {
    const livros = await livrosCollection()
      .find({}, { projection: { _id: 0 } })
      .sort({ id: 1 })
      .toArray();

    res.json(livros);

  } catch (erro) {
    console.error("ERRO AO LISTAR LIVROS:", erro);

    res.status(500).json({
      erro: "Erro ao listar livros."
    });
  }
});


// GET /api/livros/:id
app.get("/api/livros/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    return res.status(400).json({
      erro: "ID inválido."
    });
  }

  try {
    const livro = await livrosCollection().findOne(
      { id },
      { projection: { _id: 0 } }
    );

    if (!livro) {
      return res.status(404).json({
        erro: "Livro não encontrado."
      });
    }

    res.json(livro);

  } catch (erro) {
    console.error("ERRO AO BUSCAR LIVRO:", erro);

    res.status(500).json({
      erro: "Erro ao buscar livro."
    });
  }
});


// POST /api/livros
app.post("/api/livros", async (req, res) => {
  const {
    titulo,
    autor,
    categoria,
    ano,
    status,
    descricao
  } = req.body;

  if (!titulo || !autor || !categoria || !ano || !status) {
    return res.status(400).json({
      erro: "Dados obrigatórios ausentes."
    });
  }

  try {
    const novoLivro = {
      id: Date.now(),
      titulo,
      autor,
      categoria,
      ano,
      status,
      descricao
    };

    await livrosCollection().insertOne(novoLivro);

    res.status(201).json(novoLivro);

  } catch (erro) {
    console.error("ERRO AO CADASTRAR LIVRO:", erro);

    res.status(500).json({
      erro: "Erro ao cadastrar livro."
    });
  }
});


// PATCH /api/livros/:id/status
app.patch("/api/livros/:id/status", async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!Number.isFinite(id)) {
    return res.status(400).json({
      erro: "ID inválido."
    });
  }

  if (!status) {
    return res.status(400).json({
      erro: "Status não informado."
    });
  }

  try {
    const resultado = await livrosCollection().findOneAndUpdate(
      { id },
      {
        $set: {
          status
        }
      },
      {
        returnDocument: "after",
        projection: {
          _id: 0
        }
      }
    );

    if (!resultado) {
      return res.status(404).json({
        erro: "Livro não encontrado."
      });
    }

    res.json(resultado);

  } catch (erro) {
    console.error("ERRO AO ALTERAR STATUS:", erro);

    res.status(500).json({
      erro: "Erro ao alterar status do livro."
    });
  }
});


// DELETE /api/livros/:id
app.delete("/api/livros/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) {
    return res.status(400).json({
      erro: "ID inválido."
    });
  }

  try {
    const resultado = await livrosCollection().deleteOne({
      id
    });

    if (resultado.deletedCount === 0) {
      return res.status(404).json({
        erro: "Livro não encontrado."
      });
    }

    res.status(204).send();

  } catch (erro) {
    console.error("ERRO AO REMOVER LIVRO:", erro);

    res.status(500).json({
      erro: "Erro ao remover livro."
    });
  }
});


// Iniciar API
const PORT = Number(process.env.PORT) || 3000;

await conectarBanco();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API em http://localhost:${PORT}`);
});