// NCMB（データベースサービス）の設定
const NCMB_APPLICATION_KEY = "";
const NCMB_CLIENT_KEY = "";
const ncmb = new window.NCMB(NCMB_APPLICATION_KEY, NCMB_CLIENT_KEY);
const Records = ncmb.DataStore("Records");

// ローカルに保持するデータのリスト
let records = [];

// テーブルに新しい行を追加する関数
const renderTableRow = function (data) {
    const tableBody = document.getElementById("data_table").tBodies[0];
    const rowHTML = `
        <tr>
            <td>${data.date}</td>
            <td>${data.item}</td>
            <td>${data.price}</td>
        </tr>
    `;
    tableBody.insertAdjacentHTML('beforeend', rowHTML);
}

// 追加ボタンがクリックされたときの処理
const onClickAdd = function () {
    // 入力フォームからデータを取得
    const data = {
        date: document.getElementById("input_date").value,
        item: document.getElementById("input_item").value,
        price: document.getElementById("input_price").value
    };

    // ローカルのリストにデータを追加
    records.push({
        id: "", // 新規データにはIDがない
        data: data
    });

    // テーブルに新しい行を追加
    renderTableRow(data);
}


// 読み込みボタンがクリックされたときの処理
const onClickLoad = async function () {
    try {
        // データベースからデータを取得
        const results = await Records.limit(10).fetchAll();
        records = results.map(result => ({
            id: result.get("objectId"),
            data: {
                date: result.get("date"),
                item: result.get("item"),
                price: result.get("price")
            }
        }));

        // テーブルの内容を更新
        const tableBody = document.getElementById("data_table").tBodies[0];
        tableBody.innerHTML = '';
        records.forEach(doc => renderTableRow(doc.data));
    } catch (error) {
        alert("データの読み込みに失敗しました。エラーコード: " + error);
    }
}

// 保存ボタンがクリックされたときの処理
const onClickSave = async function() {
    for (const record of records) {
        // データベースに保存するための新しいレコードを作成
        const recordData = new Records();
        let saveOrUpdatePromise;

        // データを設定
        recordData.set("date", record.data.date)
            .set("item", record.data.item)
            .set("price", record.data.price);

        if (record.id) {
            // 既存のレコードの場合、IDを設定し更新処理を行う
            recordData.set("objectId", record.id);
            saveOrUpdatePromise = recordData.update();
        } else {
            // 新規のレコードの場合、保存処理を行う
            saveOrUpdatePromise = recordData.save();
        }

        try {
            // データベースに保存または更新
            await saveOrUpdatePromise;
            console.log("データが正常に保存または更新されました。");
        } catch (error) {
            console.error("データの保存または更新に失敗しました:", error);
        }
    }
}
