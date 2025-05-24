import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { Header } from "../components/Header";
import { url } from "../const";
import "./home.scss";
import PropTypes from "prop-types";

export const Home = () => {
  const [isDoneDisplay, setIsDoneDisplay] = useState("todo");
  const [lists, setLists] = useState([]);
  const [selectListId, setSelectListId] = useState();
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies();
  const handleIsDoneDisplayChange = (e) => setIsDoneDisplay(e.target.value);
  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, []);

  useEffect(() => {
    const listId = lists[0]?.id;
    if (typeof listId !== "undefined") {
      setSelectListId(listId);
      axios
        .get(`${url}/lists/${listId}/tasks`, {
          headers: {
            authorization: `Bearer ${cookies.token}`,
          },
        })
        .then((res) => {
          setTasks(res.data.tasks);
        })
        .catch((err) => {
          setErrorMessage(`タスクの取得に失敗しました。${err}`);
        });
    }
  }, [lists]);

  const handleSelectList = (id) => {
    setSelectListId(id);
    axios
      .get(`${url}/lists/${id}/tasks`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setTasks(res.data.tasks);
      })
      .catch((err) => {
        setErrorMessage(`タスクの取得に失敗しました。${err}`);
      });
  };
  Tasks.propTypes = {
    tasks: PropTypes.string.isRequired,
    selectListId: PropTypes.number.isRequired,
    isDoneDisplay: PropTypes.string.isRequired,
  };

  const handleKeyDown = (e, index) => {//keyを押した際の処理
    let newIndex;//移動先のindex
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        newIndex = index + 1;
        if (newIndex >= lists.length) {//移動先がリストの数よりも大きい値なら最初のリストに移動
          newIndex = 0;
        }

        document.getElementById(`tab-${lists[newIndex].id}`)?.focus();//移動先にフォーカスを表示
        break;

      case "ArrowLeft":
        e.preventDefault();
        newIndex = index - 1;
        if (newIndex < 0) {//移動先が0よりも小さい値なら最後のリストに移動
          newIndex = lists.length - 1;
        }
        document.getElementById(`tab-${lists[newIndex].id}`)?.focus();
        break;
      case "Enter":
        handleSelectList(lists[index].id);//フォーカスを表示しているリストを選択し、タスクを表示
        break;
      default:
        break;
    }


  };

  return (
    <div>
      <Header />
      <main className="taskList">
        <p className="error-message">{errorMessage}</p>
        <div>
          <div className="list-header">
            <h2>リスト一覧</h2>
            <div className="list-menu">
              <p>
                <Link to="/list/new">リスト新規作成</Link>
              </p>
              <p>
                <Link to={`/lists/${selectListId}/edit`}>
                  選択中のリストを編集
                </Link>
              </p>
            </div>
          </div>
          <ul role="tablist" className="list-tab">
            {lists.map((list, index) => (
              <li
                key={list.id}
                role="tab"
                tabIndex={list.id === selectListId ? 0 : -1}//tabの選択非選択の設定
                aria-selected={list.id === selectListId ? "true" : "false"}
                id={`tab-${list.id}`}
                className={`list-tab-item ${list.id === selectListId ? "active" : ""}`}
                onClick={() => handleSelectList(list.id)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              >
                {list.title}
              </li>
            ))}
          </ul>

          <div className="tasks">
            <div className="tasks-header">
              <h2>タスク一覧</h2>
              <Link to="/task/new">タスク新規作成</Link>
            </div>
            <div className="display-select-wrapper">
              <select
                onChange={handleIsDoneDisplayChange}
                className="display-select"
              >
                <option value="todo">未完了</option>
                <option value="done">完了</option>
              </select>
            </div>
            <Tasks
              tasks={tasks}
              selectListId={selectListId}
              isDoneDisplay={isDoneDisplay}
            />
          </div>
        </div>
      </main>
    </div>
  );
};






// 表示するタスク
const Tasks = (props) => {
  const { tasks, selectListId, isDoneDisplay } = props;
  const setAmountOfTime = (task) => {
    const amountOfTime = new Date(task.limit) - new Date();
    const sec = Math.floor(amountOfTime / 1000) % 60;
    const min = Math.floor(amountOfTime / 1000 / 60) % 60;
    const hours = Math.floor(amountOfTime / 1000 / 60 / 60) % 24;
    const days = Math.floor(amountOfTime / 1000 / 60 / 60 / 24);
    if (amountOfTime > 0) {
      return '残り' + days + '日' + hours + '時間' + min + '分' + sec + '秒';
    } else {
      return '期限が過ぎました';
    }
  }

  if (tasks == null) return <></>;

  if (isDoneDisplay === "done") {
    return (
      <ul>
        {tasks
          .filter((task) => {
            return task.done === true;
          })
          .map((task, key) => (
            <li key={key} className="task-item">
              <Link
                to={`/lists/${selectListId}/tasks/${task.id}`}
                className="task-item-link"
              >
                {task.title}
                <br />
                <div>期限日時　{new Date(task.limit).toLocaleString('ja-JP')}</div>
                <div>残り日時　{setAmountOfTime(task)}</div>
                {task.done ? "完了" : "未完了"}
              </Link>
            </li>
          ))}
      </ul>
    );
  }

  return (
    <ul>
      {tasks
        .filter((task) => {
          return task.done === false;
        })
        .map((task, key) => (
          <li key={key} className="task-item">
            <Link
              to={`/lists/${selectListId}/tasks/${task.id}`}
              className="task-item-link"
            >
              {task.title}
              <br />
              <div>期限日時　{new Date(task.limit).toLocaleString('ja-JP')}</div>
              <div>残り日時　{setAmountOfTime(task)}</div>
              <div>{task.done ? "完了" : "未完了"}</div>
            </Link>
          </li>
        ))}
    </ul>
  );
};
