var express = require('express');
var router = express.Router();
var model = require('../model');
var ASQ = require('asynquence');

router.get('/tasks', function(req, res, next)
{
  new model.Task()
    .fetchAll()
    .then(function(tasks){
      res.send(tasks);
    });
});

router.get('/task/:id', function(req, res, next){
  new model.Task({id: req.param('id')})
    .fetch(function(task){
      if (!task)
      {
        res.status(404);// ('Task does not exist with id = ' + req.param('id'));
        res.send({error: 'Task does not exist with id = ' + req.param('id')});
      }
      else
      {
        res.send(task.toJSON());
      }
    });
});

router.post('/task', function(req, res, next){

  new model.Task({
    title: req.body.title,
    priority: req.body.priority
  })
    .save()
    .then(function(task){
      res.send(task.toJSON());
    });
});

router.put('/task/:id', function(req, res, next){

  ASQ(function(done){
    new model.Task({id: req.param('id')})
      .fetch()
      .then(function(task){
        if (!task)
        {
          throw 'Undefined task with id = ' + req.param('id');
        }
        else
        {
          done(task);
        }
      });
  })
    .or(function(error){

      res.status(404);
      res.end('Задача не найдена');

    })
    .then(function(done, task) {

      task.set('title', req.body.title)
        .set('completed', req.body.completed)
        .set('priority', req.body.priority)
        .save()
        .then(function (task) {
          res.send(task.toJSON());
        });
    });
});

router.delete('/task/:id', function(req, res, next){
  ASQ(function(done)
    {
      new model.Task({id: req.param('id')})
      .fetch()
      .then(function(task){
        if (!task)
        {
          done.fail('Undefined task with id = ' + req.param('id'));
        }
        else
        {
          done(task);
        }
      });
    })
    .or(function(error){

      res.status(404);
      res.send({
        error:'Задача не найдена'
      });
    })
    .then(function(done, task) {

      task.destroy();
      res.sendStatus(200);
    });
});

module.exports = router;