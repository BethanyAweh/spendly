const data = {
  goal: 500,
  saved: 180,

  spending: {
    Grocery: 120,
    Takeout: 90,
    Subscriptions: 45,
    Transport: 35
  },

  food: [],
  bills: [],
  subs: []
};

document.getElementById("todayPill").innerText =
  new Date().toDateString();

document.getElementById("goalValue").innerText = "$" + data.goal;
document.getElementById("savedValue").innerText = "$" + data.saved;

const percent = (data.saved / data.goal) * 100;
document.getElementById("goalBar").style.width = percent + "%";
document.getElementById("goalText").innerText = percent.toFixed(0) + "% complete";

const ctx = document.getElementById("spendingChart");
new Chart(ctx, {
  type: "bar",
  data: {
    labels: Object.keys(data.spending),
    datasets: [{
      data: Object.values(data.spending),
      backgroundColor: "pink"
    }]
  }
});

function renderFood(){
  const table = document.getElementById("foodTable");
  table.innerHTML = "";
  data.food.forEach(i=>{
    table.innerHTML += `<tr>
      <td>${i.name}</td>
      <td>${i.quantity}</td>
      <td>${i.expires}</td>
    </tr>`;
  });
}

/* OCR → Backend */
document.getElementById("receiptInput").addEventListener("change", e=>{
  const file = e.target.files[0];
  const form = new FormData();
  form.append("image", file);

  fetch("http://localhost:5000/analyze", {
    method:"POST",
    body: form
  })
  .then(r=>r.json())
  .then(json=>{
    data.food = json.food;
    renderFood();
  });
});
