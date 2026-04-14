import { Router } from 'express';
import { query } from '../config/db.js';
import { body, validationResult } from 'express-validator';

const router = Router();

/* =========================
   ✅ Middleware Validation
========================= */
const validateUser = [
  body('nom')
    .isLength({ min: 2 })
    .withMessage('Nom doit contenir au moins 2 caractères')
    .trim()
    .escape(),

  body('prenom')
    .isLength({ min: 2 })
    .withMessage('Prénom doit contenir au moins 2 caractères')
    .trim()
    .escape(),

  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),

  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      try {
        const { rows } = await query(
          'SELECT id, nom, prenom, email FROM utilisateurs ORDER BY id DESC LIMIT 10'
        );

        return res.status(400).render('pages/home', {
          title: 'Erreur',
          users: rows,
          error: errors.array().map(e => e.msg).join(', ')
        });
      } catch (err) {
        console.error(err);
        return res.status(500).send('Erreur serveur');
      }
    }

    next();
  }
];

/* =========================
   📄 GET Home
========================= */
router.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, nom, prenom, email FROM utilisateurs ORDER BY id DESC LIMIT 10'
    );

    res.render('pages/home', {
    title: 'Accueil',
    users: rows,
    error: null
});
  } catch (err) {
    console.error(err);
    res.status(500).render('pages/home', {
      title: 'Erreur',
      users: [],
      error: 'Erreur serveur'
    });
  }
});

/* =========================
   ➕ CREATE User
========================= */
router.post('/users', validateUser, async (req, res) => {
  const { nom, prenom, email } = req.body;

  try {
    await query(
      'INSERT INTO utilisateurs (nom, prenom, email) VALUES ($1, $2, $3)',
      [nom, prenom, email]
    );

    res.redirect('/');
  } catch (err) {
    console.error(err);

    const { rows } = await query(
      'SELECT id, nom, prenom, email FROM utilisateurs ORDER BY id DESC LIMIT 10'
    );

    res.status(500).render('pages/home', {
      title: 'Erreur',
      users: rows,
      error: 'Échec de création'
    });
  }
});

/* =========================
   ✏️ UPDATE User
========================= */
router.post('/users/:id/edit', validateUser, async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email } = req.body;

  try {
    await query(
      'UPDATE utilisateurs SET nom=$1, prenom=$2, email=$3 WHERE id=$4',
      [nom, prenom, email, id]
    );

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur de mise à jour');
  }
});

/* =========================
   ❌ DELETE User
========================= */
router.post('/users/:id/delete', async (req, res) => {
  const { id } = req.params;

  try {
    await query('DELETE FROM utilisateurs WHERE id=$1', [id]);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur de suppression');
  }
});

export default router;