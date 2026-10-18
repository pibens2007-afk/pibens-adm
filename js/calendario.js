/* ============================================================
   PIBENS ADM — Módulo Calendário Batista v1.0
   ============================================================ */

const Calendario = {

  async render() {
    const c = document.getElementById('content');
    if (!c) return;

    // Lista oficial de ênfases da CBB
    const meses = [
      { mes: 'Janeiro', tema: 'Mês de Missões Mundiais', cor: '#0891b2', icon: 'fa-globe', desc: '“Ide por todo o mundo e pregai o evangelho.”' },
      { mes: 'Fevereiro', tema: 'Mês da Música Batista', cor: '#e11d48', icon: 'fa-music', desc: 'Celebrando a adoração através dos hinos.' },
      { mes: 'Março', tema: 'Missões Nacionais e Dia da Mulher Batista', cor: '#8b5cf6', icon: 'fa-flag', desc: 'Orando e contribuindo pela evangelização no Brasil.' },
      { mes: 'Abril', tema: 'Mês da Escola Bíblica Dominical (EBD)', cor: '#2563eb', icon: 'fa-book-open', desc: 'Edificando a igreja na Palavra.' },
      { mes: 'Maio', tema: 'Mês da Família Batista', cor: '#f59e0b', icon: 'fa-home', desc: '“Eu e a minha casa serviremos ao Senhor.”' },
      { mes: 'Junho', tema: 'Mês da Juventude Batista e Dia do Pastor', cor: '#7c3aed', icon: 'fa-user-tie', desc: 'Celebrando a força da juventude e honrando nossos pastores.' },
      { mes: 'Julho', tema: 'Missões Estaduais', cor: '#059669', icon: 'fa-map-marker-alt', desc: 'Evangelização e plantação de igrejas no estado.' },
      { mes: 'Agosto', tema: 'Ações Sociais Batistas e Dia dos Pais', cor: '#0284c7', icon: 'fa-hands-helping', desc: 'Servindo ao próximo e honrando os pais.' },
      { mes: 'Setembro', tema: 'Missões Nacionais', cor: '#16a34a', icon: 'fa-church', desc: 'Mobilização e oração por nossa pátria.' },
      { mes: 'Outubro', tema: 'Mês das Crianças e Embaixadores do Rei', cor: '#d97706', icon: 'fa-child', desc: 'Ensinando os pequenos no caminho em que devem andar.' },
      { mes: 'Novembro', tema: 'Educação Teológica e Dia do Homem Batista', cor: '#4f46e5', icon: 'fa-graduation-cap', desc: 'Formando obreiros e honrando os homens de Deus.' },
      { mes: 'Dezembro', tema: 'Mês da Bíblia e Celebrações do Advento/Natal', cor: '#dc2626', icon: 'fa-bible', desc: 'Celebrando o nascimento do Salvador e a Palavra viva.' }
    ];

    const mesAtual = new Date().getMonth(); // 0 a 11

    c.innerHTML = `
      <div class="card" style="background:linear-gradient(135deg, #2563eb, #7c3aed); color:#fff; border:none; margin-bottom:24px;">
        <h2 style="margin:0 0 8px 0; font-size:22px; display:flex; align-items:center; gap:8px;">
          <i class="fas fa-bookmark"></i> Calendário Batista CBB
        </h2>
        <p style="margin:0; font-size:14px; opacity:0.9;">
          Datas e ênfases oficiais da Convenção Batista Brasileira para o ano de ${new Date().getFullYear()}.
        </p>
      </div>

      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:16px;">
        ${meses.map((m, idx) => {
          const isAtual = idx === mesAtual;
          return `
            <div class="data-card" style="padding:20px; border-left:5px solid ${m.cor}; ${isAtual ? 'box-shadow:0 8px 24px rgba(37,99,235,0.15); background:#f8fafc;' : ''}">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                <span style="font-size:12px; font-weight:800; color:${m.cor}; text-transform:uppercase; letter-spacing:0.5px;">
                  ${m.mes} ${isAtual ? '• ESTE MÊS' : ''}
                </span>
                <div style="width:32px; height:32px; border-radius:8px; background:${m.cor}20; color:${m.cor}; display:flex; align-items:center; justify-content:center;">
                  <i class="fas ${m.icon}"></i>
                </div>
              </div>
              <h3 style="margin:0 0 8px 0; font-size:16px; color:#1e293b;">${m.tema}</h3>
              <p style="margin:0; font-size:13px; color:#64748b; line-height:1.5;">${m.desc}</p>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

};

console.log('%c[Calendario] Módulo carregado', 'color:#64748b;font-size:11px;');
