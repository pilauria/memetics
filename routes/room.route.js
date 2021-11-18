var express = require('express');
var router = express.Router();

const User = require('../models/User.model');
const Room = require('../models/Room.model');

/* GET home page. */
router.get('/', async (req, res) => {
  let listRooms = [];
  let error = null;
  try {
    listRooms = await Room.find();
  } catch (e) {
    error = { errType: 'DB_ERR', msg: e };
  } finally {
    res.render('rooms/rooms-list', { rooms: listRooms, error });
  }
});

router
  .route('/new')
  .get(async (req, res) => {
    const users = await User.find();
    res.render('rooms/new-room', { users });
  })
  .post(async (req, res) => {
    const { name, description, owner } = req.body;
    try {
      if (!name || !description || !owner) {
        throw new Error('All fileds required'); // res.render("rooms/new-room", { error: { type: "CRROOM_ERR", msg: "All fileds required" } })
      }
      const newRoom = await Room.create({ name, description, owner });
      res.redirect('/rooms');
    } catch (e) {
      res.render('rooms/new-room', {
        error: { type: 'DB_ERR', msg: 'WTF the DB broke' },
      });
    }
  });

module.exports = router;
