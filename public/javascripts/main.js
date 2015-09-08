var Task = Backbone.Model.extend({
  defaults:{
    title: '',
    completed: false,
    priority: 0
  },

  urlRoot: 'task',

  validate: function()
  {
    if ($.trim(this.get('title')) == '')
    {
      return 'Укажите название';
    }

    if ((this.get('priority') < 0) || (this.get('priority') > 3))
    {
      return 'Укажите корректный приоритет';
    }
  }

});

var TaskCollection = Backbone.Collection.extend({
  model: Task,
  url: '/tasks'
});

var TaskView = Backbone.View.extend({

  priorityClasses: {
    0: 'task-high',
    1: 'task-normal',
    2: 'task-low'
  },

  initialize: function () {

    this.id = 'task_' + this.model.get('id');

    this.model.on('change', this.changeTaskHandler, this);
    this.model.on('destroy', this.destroyTaskHandler, this);
    this.model.on('invalid', this.modelInvalidHandler, this);

    this.updatePriority();
  },

  changeTaskHandler: function () {
    if (this.model.get('title') != this.$('.title').text()) {
      this.$('.title').text(this.model.get('title'));
      this.$('input[name="title"]').val(this.model.get('title'));
    }

    if (this.model.get('completed')) {
      this.$('input[name="completed"]').attr('checked', 'checked');
      this.$('.title').css('text-decoration', 'line-through');
    }
    else {
      this.$('input[name="completed"]').removeAttr('checked');
      this.$('.title').css('text-decoration', 'none');
    }

    this.updatePriority();

    this.model.save();
  },

  updatePriority: function()
  {
    for (var priority in this.priorityClasses)
    {
      this.$el.removeClass(this.priorityClasses[priority]);
    }

    this.$el.addClass(this.priorityClasses[this.model.get('priority')]);

    return this;
  },


  destroyTaskHandler: function () {
    this.model.off(null, null, this);
  },

  modelInvalidHandler: function(task, error)
  {
    alert(error);
  },

  tagName: 'tr',
  className: 'task',
  template: _.template(templates.taskItem),

  events: {
    'change input[name="completed"]': 'changeCompletedHandler',
    'change input[name="title"]': 'changeTitleHandler',
    'blur input[name="title"]': 'changeTitleHandler',
    'click .edit': 'editTitleHandler',
    'click .delete': 'deleteHandler'
  },

  changeCompletedHandler: function (event) {
    this.model.set('completed', this.$('input[name="completed"]').is(':checked'));
  },

  changeTitleHandler: function (event) {
    this.model.set('title', $.trim(this.$('input[name="title"]').val()));

    this.$('input[name="title"]').hide();
    this.$('.title').show();
  },

  editTitleHandler: function (event)
  {
    this.$('.title').hide();
    this.$('input[name="title"]').show();
  },

  deleteHandler: function(event)
  {
    if (confirm('Вы действительно хотите удалить задачу?'))
    {
      this.model.destroy();
    }
  },

  render: function()
  {
    this.$el.html(this.template(this.model.toJSON()));
    this.$el.attr('id', 'task_' + this.model.get('id'));
    return this;
  }
});

var TaskCollectionView = Backbone.View.extend({
  //className: 'tasks',

  tagName: 'table',

  initialize: function()
  {
    this.collection.on('add', function(task){

      var taskView = new TaskView({model: task});
      this.$el.append(taskView.render().el);

    }, this);

    this.collection.on('remove', function(task)
    {
      this.$el.find('#task_' + task.get('id')).remove();
    }, this);
  },

  render: function()
  {
    this.collection.each(function(task){

      var taskView = new TaskView({model: task});
      this.$el.append(taskView.render().el);
    }, this);

    return this;
  }
});

var TaskApp = Backbone.View.extend({
  el: '#app',
  events: {
    'submit .taskForm': 'submit'
  },

  initialize: function()
  {
    this.collection = new TaskCollection();

    this.collectionView = new TaskCollectionView({collection: this.collection, el: '#tasks'});

    this.collection.fetch();
  },

  submit: function(event)
  {
    event.preventDefault();
    this.$('.taskForm .error').hide();

    var task = new Task({
      title: this.$('.taskForm input[name="title"]').val(),
      priority: this.$('.taskForm select[name="priority"]').val()
    });

    var error = null;
    if (error = task.validate())
    {
      this.$('.taskForm .error').text(error).show();
    }
    else {
      //this.$('.taskForm input, .taskForm textarea').attr('disabled', 'disabled');

      this.listenToOnce(task, 'sync', function(task){
        this.collection.add(task);
        this.$('.taskForm input, .taskForm textarea').removeAttr('disabled');
        this.$('.taskForm')[0].reset();
      });

      task.save();
    }
  }
});


$(function () {

  var application = new TaskApp();

});