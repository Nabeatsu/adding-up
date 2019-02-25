"use strict";
// Node.jsに用意されたモジュール呼び出し
// fs は FileSystemの略。　ファイルを扱うためのモジュール
// readlineは、ファイルを一行ずつ読み込むためのモジュール
const fs = require("fs");
const readline = require("readline");

// pupu-pref.csv ファイルからファイルを読み込みを行うStreamを生成
// その後 readline オブジェクトの input として設定し、 rl オブジェクトを作成
const rs = fs.ReadStream("./popu-pref.csv");
const rl = readline.createInterface({ input: rs, output: {} });
const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト

// rl オブジェクトで line というイベントが発生したら引数2の無名関数を呼ぶという意味。
rl.on("line", lineString => {
  const columns = lineString.split(",");
  // parseInt関数: 文字列から数値へ変換 SwiftでいうInt()やas? Intみたいな
  // 後々数値と比較する際に不都合が生じるためあらかじめ数値に変換
  const year = parseInt(columns[0]);
  const prefecture = columns[2];
  const popu = parseInt(columns[7]);
  if (year === 2010 || year === 2015) {
    let value = prefectureDataMap.get(prefecture);
    if (!value) {
      value = {
        popu10: 0,
        popu15: 0,
        change: null
      };
    }
    if (year === 2010) {
      value.popu10 += popu;
    }
    if (year === 2015) {
      value.popu15 += popu;
    }

    prefectureDataMap.set(prefecture, value);
  }
});

rl.on("close", () => {
  // for-of statement, Mapの分割代入
  for (let [key, value] of prefectureDataMap) {
    value.change = value.popu15 / value.popu10;
  }
  // Array.fromで連想配列を配列に変換
  const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
    return pair2[1].change - pair1[1].change;
  });
  const rankingArrayStrings = rankingArray.map(([key, value]) => {
    return (
      key +
      ": " +
      value.popu10 +
      "=>" +
      value.popu15 +
      " 変化率:" +
      value.change
    );
  });
  console.log(rankingArrayStrings);
});
