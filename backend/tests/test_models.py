from models import User
from models import TodoItem, Comment, db

# ทดสอบกรณีพิมพ์รหัสผ่านถูก
def test_check_correct_password(app_context):
    user = User()
    user.set_password("testpassword")
    # ต้องได้ True
    assert user.check_password("testpassword") == True

# ทดสอบกรณีพิมพ์รหัสผ่านผิด
def test_check_incorrect_password(app_context):
    user = User()
    user.set_password("testpassword")
    # ต้องได้ False เพราะสะกดผิด (เติม x เข้าไป)
    assert user.check_password("testpasswordx") == False

def test_empty_todoitem(app_context):
    assert TodoItem.query.count() == 0

def create_todo_item_1():
    todo = TodoItem(title='Todo with comments', done=True)
    comment = Comment(message='Nested', todo=todo)
    db.session.add_all([todo, comment])
    db.session.commit()
    return todo

def test_todo_to_dict_includes_nested_comments(app_context):
    todo = create_todo_item_1()
    id = todo.id

    test_todo = TodoItem.query.get(id)
    assert len(test_todo.comments) == 1