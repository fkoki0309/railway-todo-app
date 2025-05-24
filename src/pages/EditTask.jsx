import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";
import axios from "axios";
import { useCookies } from "react-cookie";
import { url } from "../const";
import { useNavigate, useParams } from "react-router-dom";
import "./editTask.scss";

export const EditTask = () => {
  const navigate = useNavigate();
  const { listId, taskId } = useParams();
  const [cookies] = useCookies();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [isDone, setIsDone] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const [limit, setLimit] = useState('');
  const handleLimitChange = (e) => setLimit(e.target.value);
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleIsDoneChange = (e) => setIsDone(e.target.value === "done");

  const toLocalISOString = (date) => {
    if (!(date instanceof Date)) {
      date = new Date(date)
    }
    // もし不正な日時ならば'Invalid Date'を返す
    // 'Invalid Date'は Date オブジェクトの仕様で定められている日付として不正な時に返す文字列
    // @see https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date-objects
    if (date.toString() === 'Invalid Date') {
      return 'Invalid Date';
    }
    // 連続して同じ処理を行うので関数化して略しやすくする
    // 1桁の数値でも必ず2桁になるようにする
    const pad = num => String(num).padStart(2, '0');
    // Date オブジェクトの各メソッドと↑のパディング関数を用いてISO形式を構築するための年月日時分秒の文字列を用意
    const yyyy = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    // タイムゾーン文字列を用意
    // getTimezoneOffset メソッドは現在のロケールから協定世界時 (UTC) までのタイムゾーンの差を分単位で返すのでマイナスをかけて反転
    const tzMin = -date.getTimezoneOffset();
    // 分のみで構成されたタイムゾーンから符号、時、余りの分を抜き出してISO形式を構築するためのタイムゾーン文字列を用意
    const timezone = `${tzMin >= 0 ? '+' : '-'}${pad(Math.floor(Math.abs(tzMin) / 60))}:${pad(Math.abs(tzMin) % 60)}`
    // ここまでで用意したそれぞれをISO形式になるようにとりまとめる
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}${timezone}`;
  }

  const onUpdateTask = () => {
    console.log(isDone);
    const formattedDate = limit ? toLocalISOString(new Date(limit)) : null;//ISO形式に直す
    const data = {
      title: title,
      detail: detail,
      done: isDone,
      limit: formattedDate,
    };

    axios
      .put(`${url}/lists/${listId}/tasks/${taskId}`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        navigate("/");
      })
      .catch((err) => {
        setErrorMessage(`更新に失敗しました。${err}`);
      });
  };

  const onDeleteTask = () => {
    axios
      .delete(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        setErrorMessage(`削除に失敗しました。${err}`);
      });
  };

  useEffect(() => {
    axios
      .get(`${url}/lists/${listId}/tasks/${taskId}`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        const task = res.data;
        setTitle(task.title);
        setDetail(task.detail);
        setIsDone(task.done);
        setLimit(task.limit ? toLocalISOString(task.limit).slice(0, 16) : "");//期限取得
      })
      .catch((err) => {
        setErrorMessage(`タスク情報の取得に失敗しました。${err}`);
      });
  }, []);

  return (
    <div>
      <Header />
      <main className="edit-task">
        <h2>タスク編集</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="edit-task-form">
          <label>タイトル</label>
          <br />
          <input
            type="text"
            onChange={handleTitleChange}
            className="edit-task-title"
            value={title}
          />
          <br />
          <label>詳細</label>
          <br />
          <textarea
            type="text"
            onChange={handleDetailChange}
            className="edit-task-detail"
            value={detail}
          />
          <br />
          <input
            type="datetime-local"
            id="edit-DateTime"
            onChange={handleLimitChange}
            value={limit} />
          <br />

          <div>
            <input
              type="radio"
              id="todo"
              name="status"
              value="todo"
              onChange={handleIsDoneChange}
              checked={isDone === false ? "checked" : ""}
            />
            未完了
            <input
              type="radio"
              id="done"
              name="status"
              value="done"
              onChange={handleIsDoneChange}
              checked={isDone === true ? "checked" : ""}
            />
            完了
          </div>
          <button
            type="button"
            className="delete-task-button"
            onClick={onDeleteTask}
          >
            削除
          </button>
          <button
            type="button"
            className="edit-task-button"
            onClick={onUpdateTask}
          >
            更新
          </button>
        </form>
      </main>
    </div>
  );
};
