import pytest
from http import HTTPStatus
from models import TodoItem, db
from flask_jwt_extended import create_access_token

@pytest.fixture
def access_token(app):
    with app.app_context():
        # สร้าง Token ปลอมๆ สำหรับ User ID 1
        return create_access_token(identity='1')

def create_todo(title='Sample todo', done=False):
    todo = TodoItem(title=title, done=done)
    db.session.add(todo)
    db.session.commit()
    return todo

@pytest.fixture
def sample_todo_items(app_context):
    todo1 = create_todo(title='Todo 1', done=False)
    todo2 = create_todo(title='Todo 2', done=True)
    return [todo1, todo2]

def test_get_sample_todo_items(client, sample_todo_items, access_token):
    headers = {'Authorization': f'Bearer {access_token}'}
    response = client.get('/api/todos/', headers=headers)
    assert response.status_code == HTTPStatus.OK
    assert response.get_json() == [todo.to_dict() for todo in sample_todo_items]

def test_toggle_todo_item(client, sample_todo_items, access_token):
    item1, item2 = sample_todo_items
    headers = {'Authorization': f'Bearer {access_token}'}
    response = client.patch(f'/api/todos/{item1.id}/toggle/', headers=headers)
    assert response.status_code == HTTPStatus.OK
    data = response.get_json()
    assert data['done'] is True
    assert TodoItem.query.get(item1.id).done is True