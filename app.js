import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import indexRoutes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration d’EJS
app.set('view engine', 'ejs');
app.set('views', path.resolve('views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve('public')));

// Routes
app.use('/', indexRoutes);

// Gestion des erreurs 404
app.use((_, res) => res.status(404).render('pages/home', { 
  title: 'Page non trouvée', users: [], error: '404 – Ressource introuvable' 
}));

// Démarrage
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});