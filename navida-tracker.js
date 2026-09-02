(function(){

  /* ---------------- State ---------------- */
  var customers = [];
  var activeId = null;
  var searchTerm = "";
  var photoDataUrl = null;

  function uid(){ return 'c_' + Math.random().toString(36).slice(2,10); }

  function initials(name){
    return name.trim().split(/\s+/).slice(0,2).map(function(w){return w[0]||'';}).join('').toUpperCase();
  }

  function money(n){
    n = Number(n)||0;
    return 'GH₵ ' + n.toLocaleString('en-GH',{minimumFractionDigits:2, maximumFractionDigits:2});
  }

  function fmtDate(d){
    var dt = new Date(d);
    return dt.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  }

  /* ---------------- Rendering: sidebar list ---------------- */
  function renderList(){
    var listEl = document.getElementById('customerList');
    var countEl = document.getElementById('customerCount');
    var filtered = customers.filter(function(c){
      if(!searchTerm) return true;
      var t = searchTerm.toLowerCase();
      return c.name.toLowerCase().indexOf(t)>-1 || c.country.toLowerCase().indexOf(t)>-1;
    });
    countEl.textContent = customers.length;
    listEl.innerHTML = '';

    if(customers.length === 0){
      listEl.innerHTML = '<li class="empty-list">No customers yet. Add your first customer to start tracking their deal.</li>';
      return;
    }
    if(filtered.length === 0){
      listEl.innerHTML = '<li class="empty-list">No matches for "'+escapeHtml(searchTerm)+'".</li>';
      return;
    }

    filtered.forEach(function(c){
      var balance = totalBalance(c);
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.className = 'customer-item' + (c.id===activeId ? ' active':'');
      btn.type = 'button';
      btn.onclick = function(){ activeId = c.id; render(); };

      var avatarHtml = c.photo
        ? '<img src="'+c.photo+'" alt="">'
        : initials(c.name);

      btn.innerHTML =
        '<span class="avatar">'+avatarHtml+'</span>'+
        '<span class="ci-main">'+
          '<span class="ci-name">'+escapeHtml(c.name)+'</span>'+
          '<span class="ci-sub">'+escapeHtml(purposeLabel(c))+' · '+escapeHtml(c.country)+'</span>'+
        '</span>'+
        '<span class="ci-balance'+(balance<=0?' paid':'')+'">'+(balance<=0 ? 'Paid':money(balance))+'</span>';

      li.appendChild(btn);
      listEl.appendChild(li);
    });
  }

  function purposeLabel(c){
    return c.purpose === 'Other' && c.purposeOther ? c.purposeOther : c.purpose;
  }

  function totalBalance(c){
    var total = c.totalAmount - c.payments.reduce(function(s,p){return s+p.amount;},0);
    return Math.max(0, Math.round(total*100)/100);
  }
  function totalPaid(c){
    return c.payments.reduce(function(s,p){return s+p.amount;},0);
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m];
    });
  }

  /* ---------------- Rendering: main panel ---------------- */
  function renderMain(){
    var main = document.getElementById('mainPanel');
    var c = customers.find(function(x){return x.id===activeId;});

    if(!c){
      main.innerHTML =
        '<div class="empty-state">'+
          '<svg width="40" height="40" viewBox="0 0 34 34" fill="none"><circle cx="17" cy="17" r="16" stroke="#0F2E5C" stroke-width="1.6"/><path d="M17 6 L20 15 L29 17 L20 19 L17 28 L14 19 L5 17 L14 15 Z" fill="#0F2E5C"/></svg>'+
          '<h2>Track a customer&rsquo;s deal</h2>'+
          '<p>Select a customer on the left, or add a new one to record their trip purpose, destination, charges, payments and to-dos.</p>'+
        '</div>';
      return;
    }

    var paid = totalPaid(c);
    var balance = totalBalance(c);
    var pct = c.totalAmount > 0 ? Math.min(100, Math.round((paid/c.totalAmount)*100)) : 0;

    var photoHtml = c.photo ? '<img src="'+c.photo+'" alt="">' : initials(c.name);

    var paymentLogHtml = c.payments.length === 0
      ? '<p class="log-empty">No payments recorded yet.</p>'
      : '<ul class="payment-log">' + c.payments.slice().reverse().map(function(p){
          return '<li><span class="pl-date">'+fmtDate(p.date)+(p.note?' · '+escapeHtml(p.note):'')+'</span><span class="pl-amount">+'+money(p.amount)+'</span></li>';
        }).join('') + '</ul>';

    var todoHtml = c.todos.length === 0
      ? '<p class="todo-empty">Nothing on the to-do list yet — add documents, tasks or reminders for this deal.</p>'
      : '<ul class="todo-list">' + c.todos.map(function(t, idx){
          return '<li class="todo-item">'+
            '<button class="todo-check'+(t.done?' done':'')+'" data-todo="'+idx+'" aria-label="Toggle task">'+
              (t.done ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6.5L4.8 9L10 3" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '')+
            '</button>'+
            '<span class="todo-text'+(t.done?' done':'')+'">'+escapeHtml(t.text)+'</span>'+
            '<button class="todo-del" data-tododel="'+idx+'" aria-label="Delete task"><svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 4h9M6 4V2.5h3V4M4.5 4l.5 8.5h5l.5-8.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></button>'+
          '</li>';
        }).join('') + '</ul>';

    main.innerHTML =
      '<div class="profile-head">'+
        '<div class="photo">'+photoHtml+'</div>'+
        '<div>'+
          '<div class="profile-name-row">'+
            '<span class="profile-name serif">'+escapeHtml(c.name)+'</span>'+
            '<span class="chip'+(balance<=0?' paid':'')+'">'+escapeHtml(purposeLabel(c))+'</span>'+
          '</div>'+
          '<div class="profile-meta">'+
            '<span>'+flagEmojiOrDot()+' '+escapeHtml(c.country)+'</span>'+
            (c.phone ? '<span>'+escapeHtml(c.phone)+'</span>' : '')+
            (c.email ? '<span>'+escapeHtml(c.email)+'</span>' : '')+
          '</div>'+
          '<label class="photo-upload-label" for="mainPhotoInput">Change photo</label>'+
          '<input type="file" id="mainPhotoInput" accept="image/*">'+
        '</div>'+
      '</div>'+

      '<div class="section">'+
        '<h3>Deal summary</h3>'+
        '<div class="deal-numbers">'+
          '<div><div class="deal-num-label">Total charged</div><div class="deal-num-value">'+money(c.totalAmount)+'</div></div>'+
          '<div><div class="deal-num-label">Paid so far</div><div class="deal-num-value" style="color:var(--ok)">'+money(paid)+'</div></div>'+
          '<div><div class="deal-num-label">Balance left</div><div class="deal-num-value balance'+(balance<=0?' zero':'')+'">'+money(balance)+'</div></div>'+
        '</div>'+
        '<div class="progress-track"><div class="progress-fill" style="width:'+pct+'%"></div></div>'+
        '<div class="progress-caption">'+pct+'% of the deal is paid'+(balance<=0?' — deal complete.':'.')+'</div>'+
        '<form class="payment-form" id="paymentForm">'+
          '<input type="number" min="0.01" step="0.01" id="paymentAmount" placeholder="Amount" '+(balance<=0?'disabled':'')+' required>'+
          '<input type="text" id="paymentNote" placeholder="Note (optional, e.g. visa fee)" '+(balance<=0?'disabled':'')+'>'+
          '<button type="submit" class="btn-small" '+(balance<=0?'disabled':'')+'>Record payment</button>'+
        '</form>'+
        paymentLogHtml+
      '</div>'+

      '<div class="section">'+
        '<h3>Customer details</h3>'+
        '<div class="customer-detail-fields">'+
          '<div><div class="cdf-label">Purpose of travel</div><div class="cdf-value">'+escapeHtml(purposeLabel(c))+'</div></div>'+
          '<div><div class="cdf-label">Destination</div><div class="cdf-value">'+escapeHtml(c.country)+'</div></div>'+
          '<div><div class="cdf-label">Phone</div><div class="cdf-value">'+escapeHtml(c.phone||'—')+'</div></div>'+
          '<div><div class="cdf-label">Email</div><div class="cdf-value">'+escapeHtml(c.email||'—')+'</div></div>'+
        '</div>'+
      '</div>'+

      '<div class="section">'+
        '<h3>To-do list</h3>'+
        '<div class="todo-add">'+
          '<input type="text" id="todoInput" placeholder="e.g. Collect passport copy">'+
          '<button class="btn-small" id="todoAddBtn">Add</button>'+
        '</div>'+
        todoHtml+
      '</div>'+

      '<div class="danger-zone">'+
        '<button class="btn-danger" id="removeCustomerBtn">Remove customer</button>'+
      '</div>';

    // wire up main-panel events
    document.getElementById('paymentForm').addEventListener('submit', function(e){
      e.preventDefault();
      var amt = parseFloat(document.getElementById('paymentAmount').value);
      var note = document.getElementById('paymentNote').value.trim();
      if(!amt || amt<=0) return;
      var bal = totalBalance(c);
      if(amt > bal) amt = bal; // never overpay past balance
      c.payments.push({amount: Math.round(amt*100)/100, date: new Date().toISOString(), note: note});
      render();
    });

    document.getElementById('todoAddBtn').addEventListener('click', addTodoFromInput);
    document.getElementById('todoInput').addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); addTodoFromInput(); }
    });
    function addTodoFromInput(){
      var input = document.getElementById('todoInput');
      var v = input.value.trim();
      if(!v) return;
      c.todos.push({text:v, done:false});
      input.value='';
      render();
    }

    main.querySelectorAll('[data-todo]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var idx = parseInt(btn.getAttribute('data-todo'),10);
        c.todos[idx].done = !c.todos[idx].done;
        render();
      });
    });
    main.querySelectorAll('[data-tododel]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var idx = parseInt(btn.getAttribute('data-tododel'),10);
        c.todos.splice(idx,1);
        render();
      });
    });

    document.getElementById('removeCustomerBtn').addEventListener('click', function(){
      showConfirm('Remove '+c.name+' and all their deal data? This cannot be undone.', function(){
        customers = customers.filter(function(x){return x.id!==c.id;});
        activeId = null;
        render();
        showToast(c.name+' was removed.');
      });
    });

    document.getElementById('mainPhotoInput').addEventListener('change', function(e){
      var file = e.target.files[0];
      if(!file) return;
      var reader = new FileReader();
      reader.onload = function(ev){
        c.photo = ev.target.result;
        render();
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------------- Toast + confirm modal ---------------- */
  var toastTimer = null;
  function showToast(msg){
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 2600);
  }

  var confirmModal = document.getElementById('confirmModal');
  var pendingConfirmAction = null;
  function showConfirm(message, onConfirm){
    document.getElementById('confirmMessage').textContent = message;
    pendingConfirmAction = onConfirm;
    confirmModal.style.display = 'flex';
  }
  document.getElementById('confirmCancel').addEventListener('click', function(){
    confirmModal.style.display = 'none';
    pendingConfirmAction = null;
  });
  document.getElementById('confirmOk').addEventListener('click', function(){
    var action = pendingConfirmAction;
    confirmModal.style.display = 'none';
    pendingConfirmAction = null;
    if(action) action();
  });
  confirmModal.addEventListener('click', function(e){
    if(e.target===confirmModal){ confirmModal.style.display='none'; pendingConfirmAction=null; }
  });

  function flagEmojiOrDot(){
    return '<svg width="12" height="12" viewBox="0 0 12 12" style="vertical-align:-1px;"><circle cx="6" cy="6" r="5" fill="#1C4B8C"/></svg>';
  }

  function render(){
    renderList();
    renderMain();
  }

  /* ---------------- Add-customer modal ---------------- */
  var addModal = document.getElementById('addModal');
  document.getElementById('openAddModal').addEventListener('click', function(){
    document.getElementById('addForm').reset();
    photoDataUrl = null;
    document.getElementById('photoPreview').innerHTML = '<svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="3.2" stroke="#9FB3D6" stroke-width="1.4"/><path d="M3 19c1.6-3.6 5-5.6 8-5.6s6.4 2 8 5.6" stroke="#9FB3D6" stroke-width="1.4"/></svg>';
    document.getElementById('f_purpose_other_wrap').style.display = 'none';
    addModal.style.display = 'flex';
    document.getElementById('f_name').focus();
  });
  document.getElementById('cancelAdd').addEventListener('click', function(){ addModal.style.display='none'; });
  addModal.addEventListener('click', function(e){ if(e.target===addModal) addModal.style.display='none'; });

  document.getElementById('f_purpose').addEventListener('change', function(){
    document.getElementById('f_purpose_other_wrap').style.display = this.value==='Other' ? 'block' : 'none';
  });

  document.getElementById('f_photo').addEventListener('change', function(e){
    var file = e.target.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(ev){
      photoDataUrl = ev.target.result;
      document.getElementById('photoPreview').innerHTML = '<img src="'+photoDataUrl+'" alt="">';
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('addForm').addEventListener('submit', function(e){
    e.preventDefault();
    var name = document.getElementById('f_name').value.trim();
    var purpose = document.getElementById('f_purpose').value;
    var purposeOther = document.getElementById('f_purpose_other').value.trim();
    var country = document.getElementById('f_country').value.trim();
    var phone = document.getElementById('f_phone').value.trim();
    var email = document.getElementById('f_email').value.trim();
    var totalAmount = parseFloat(document.getElementById('f_amount').value) || 0;
    var paidNow = parseFloat(document.getElementById('f_paid').value) || 0;
    if(!name || !country || totalAmount<=0) return;

    var c = {
      id: uid(),
      name: name,
      purpose: purpose,
      purposeOther: purposeOther,
      country: country,
      phone: phone,
      email: email,
      totalAmount: Math.round(totalAmount*100)/100,
      photo: photoDataUrl,
      payments: [],
      todos: []
    };
    if(paidNow>0){
      c.payments.push({amount: Math.min(paidNow,totalAmount), date: new Date().toISOString(), note:'Initial payment'});
    }
    customers.push(c);
    activeId = c.id;
    addModal.style.display = 'none';
    render();
  });

  /* ---------------- Search ---------------- */
  document.getElementById('searchInput').addEventListener('input', function(){
    searchTerm = this.value;
    renderList();
  });

  /* ---------------- Export / Import ---------------- */
  document.getElementById('exportBtn').addEventListener('click', function(){
    var blob = new Blob([JSON.stringify({customers:customers}, null, 2)], {type:'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'navida-customers-'+new Date().toISOString().slice(0,10)+'.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('importBtn').addEventListener('click', function(){
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', function(e){
    var file = e.target.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(ev){
      try{
        var data = JSON.parse(ev.target.result);
        if(data && Array.isArray(data.customers)){
          customers = data.customers;
          activeId = customers.length ? customers[0].id : null;
          render();
          showToast('Imported '+customers.length+' customer'+(customers.length===1?'':'s')+'.');
        }else{
          showToast('This file doesn\'t look like a Navida export.');
        }
      }catch(err){
        showToast('Could not read that file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  /* ---------------- Init ---------------- */
  render();

})();
