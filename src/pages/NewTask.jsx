import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import axios from "axios";
import { url } from "../const";
import { Header } from "../components/Header";
import "./newTask.scss";
import { useNavigate } from "react-router-dom";

export const NewTask = () => {
  const [selectListId, setSelectListId] = useState();
  const [lists, setLists] = useState([]);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [cookies] = useCookies();
  const [limit, setLimit] = useState('');
  const navigate = useNavigate();
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleDetailChange = (e) => setDetail(e.target.value);
  const handleSelectList = (id) => setSelectListId(id);
  const handleLimitChange = (e) => setLimit(e.target.value);
  const toLocalISOString = (date) => {//ISOSTRINGにタイムゾーンを適用
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

  const onCreateTask = () => {
    const formattedDate = limit ? toLocalISOString(new Date(limit)) : null;//ISO形式に直す
    const data = {
      title: title,
      detail: detail,
      done: false,
      limit: formattedDate,
    };

    axios
      .post(`${url}/lists/${selectListId}/tasks`, data, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        console.log(data);
        setErrorMessage(`タスクの作成に失敗しました。${err}`);
      });
  };

  useEffect(() => {
    axios
      .get(`${url}/lists`, {
        headers: {
          authorization: `Bearer ${cookies.token}`,
        },
      })
      .then((res) => {
        setLists(res.data);
        setSelectListId(res.data[0]?.id);
      })
      .catch((err) => {
        setErrorMessage(`リストの取得に失敗しました。${err}`);
      });
  }, []);

  return (
    <div>
      <Header />
      <main className="new-task">
        <h2>タスク新規作成</h2>
        <p className="error-message">{errorMessage}</p>
        <form className="new-task-form">
          <label>リスト</label>
          <br />
          <select
            onChange={(e) => handleSelectList(e.target.value)}
            className="new-task-select-list"
          >
            {lists.map((list, key) => (
              <option key={key} className="list-item" value={list.id}>
                {list.title}
              </option>
            ))}
          </select>
          <br />
          <label>タイトル</label>
          <br />
          <input
            type="text"
            onChange={handleTitleChange}
            className="new-task-title"
          />
          <br />
          <label>詳細</label>
          <br />
          <textarea
            type="text"
            onChange={handleDetailChange}
            className="new-task-detail"
          />
          <br />
          <label>期限</label>
          <br />
          <input
            type="datetime-local"
            id="inputDateTime"
            onChange={handleLimitChange}
            value={limit} />
          <br />

          <button
            type="button"
            className="new-task-button"
            onClick={onCreateTask}
          >
            作成
          </button>
        </form>
      </main>
    </div>
  );
};
