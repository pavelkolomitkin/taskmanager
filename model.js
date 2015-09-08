var bookshelf = require('./dbconnect');

var Task = bookshelf.Model.extend({
  tableName: 'task',
  getData: function()
  {
    return {
      id: this.get('id'),
      title: this.get('title'),
      completed: this.get('completed'),
      priority: this.get('priority')
    };
  }
});

exports.Task = Task;