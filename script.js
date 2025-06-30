document.addEventListener('DOMContentLoaded', function() {
    // --- SELETORES DE ELEMENTOS ---
    const docElement = document.documentElement;
    const header = document.getElementById('main-header');
    const themeToggleButton = document.getElementById('theme-toggle');
    const mobileMenuButton = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const feedbackForm = document.getElementById('feedbackForm');

    // --- 1. LÓGICA DO TEMA (MODO CLARO/ESCURO) ---

    // Função centralizada para aplicar o tema
    function applyTheme(theme) {
        docElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        // Garante que os componentes sejam atualizados apenas se já existirem
        if (window.qualityChart) window.qualityChart.updateChartTheme();
        if (window.map) window.map.updateMapTheme();
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const newTheme = docElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    // --- 2. LÓGICA DO MENU MÓVEL ---
    if (mobileMenuButton && mainNav) {
        mobileMenuButton.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileMenuButton.classList.toggle('active');
        });

        // Fecha o menu ao clicar em um link (ótima UX!)
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                mobileMenuButton.classList.remove('active');
            });
        });
    }

    // --- 3. EFEITO DO CABEÇALHO AO ROLAR ---
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // --- 4. ANIMAÇÃO DE REVELAÇÃO AO ROLAR ---
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (revealElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Anima apenas uma vez
                }
            });
        }, { threshold: 0.1 });
        revealElements.forEach(el => observer.observe(el));
    }

    // --- 5. LÓGICA DO DASHBOARD ---
    
    // Simulação de atualização de dados das métricas
    const gerarValor = (base, variacao) => base + (Math.random() - 0.5) * variacao;
    function atualizarMetricas() {
        const phValueEl = document.getElementById('ph-value');
        if (phValueEl) phValueEl.textContent = gerarValor(7.2, 0.5).toFixed(1);
        
        const turbidezValueEl = document.getElementById('turbidez-value');
        if (turbidezValueEl) turbidezValueEl.textContent = gerarValor(5, 2).toFixed(1);

        const oxigenioValueEl = document.getElementById('oxigenio-value');
        if (oxigenioValueEl) oxigenioValueEl.textContent = gerarValor(8.0, 1).toFixed(1);

        const temperaturaValueEl = document.getElementById('temperatura-value');
        if (temperaturaValueEl) temperaturaValueEl.textContent = gerarValor(19.5, 2).toFixed(1);
    }

    // --- MAPA (LEAFLET) ---
    const mapElement = document.getElementById('map');
    if (mapElement) {
        window.map = (function() {
            let mapInstance = L.map(mapElement, { scrollWheelZoom: false }).setView([48.8566, 2.3522], 12);
            let mapTileLayer;

            function updateMapTheme() {
                const isDark = docElement.getAttribute('data-theme') === 'dark';
                const mapUrl = isDark 
                    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
                    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
                
                if (mapTileLayer) mapInstance.removeLayer(mapTileLayer);
                
                mapTileLayer = L.tileLayer(mapUrl, {
                    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
                    maxZoom: 20
                }).addTo(mapInstance);
            }

            // Função para criar os ícones dinâmicos (sua excelente implementação!)
            const getIcon = (status) => {
                const color = getComputedStyle(document.documentElement).getPropertyValue(`--status-${status}`).trim();
                return L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color:${color};" class="marker-pin"></div><i class="fas fa-water"></i>`,
                    iconSize: [30, 42],
                    iconAnchor: [15, 42]
                });
            };
            
            const sensores = [
                { lat: 48.8600, lng: 2.3270, nome: "Sensor Louvre", status: "good" },
                { lat: 48.8530, lng: 2.3490, nome: "Sensor Notre-Dame", status: "good" },
                { lat: 48.8462, lng: 2.3730, nome: "Sensor Gare d'Austerlitz", status: "warning" },
                { lat: 48.8698, lng: 2.2945, nome: "Sensor Torre Eiffel", status: "good" },
                { lat: 48.8320, lng: 2.2500, nome: "Sensor Pont de Sèvres", status: "danger" }
            ];

            sensores.forEach(sensor => {
                L.marker([sensor.lat, sensor.lng], { icon: getIcon(sensor.status) })
                    .addTo(mapInstance)
                    .bindPopup(`<b>${sensor.nome}</b><br>Status: ${sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1)}`);
            });

            return { mapInstance, updateMapTheme };
        })();
    }

    // --- GRÁFICO (CHART.JS) ---
    const chartElement = document.getElementById('qualityChart');
    if (chartElement) {
        window.qualityChart = (function() {
            const ctx = chartElement.getContext('2d');
            
            const createGradient = (color1, color2) => {
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, color1);
                gradient.addColorStop(1, color2);
                return gradient;
            };

            const chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array.from({length: 15}, (_, i) => i), // Labels iniciais simples
                    datasets: [
                        { label: 'pH', data: Array.from({length: 15}, () => gerarValor(7.2, 0.5)), borderColor: '#e76f51', backgroundColor: createGradient('rgba(231, 111, 81, 0.3)', 'rgba(231, 111, 81, 0)'), fill: true, tension: 0.4, pointRadius: 0 },
                        { label: 'Turbidez', data: Array.from({length: 15}, () => gerarValor(5, 2)), borderColor: '#f4a261', backgroundColor: createGradient('rgba(244, 162, 97, 0.3)', 'rgba(244, 162, 97, 0)'), fill: true, tension: 0.4, pointRadius: 0 },
                        { label: 'Oxigênio', data: Array.from({length: 15}, () => gerarValor(8, 1)), borderColor: '#2a9d8f', backgroundColor: createGradient('rgba(42, 157, 143, 0.3)', 'rgba(42, 157, 143, 0)'), fill: true, tension: 0.4, pointRadius: 0 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: { y: { beginAtZero: false }, x: { ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 7 } } },
                    plugins: { legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'circle' } } },
                    interaction: { intersect: false, mode: 'index' },
                }
            });

            function updateChartTheme() {
                const textColor = getComputedStyle(docElement).getPropertyValue('--text-primary').trim();
                const gridColor = getComputedStyle(docElement).getPropertyValue('--card-border-color').trim() + '80';
                
                chartInstance.options.plugins.legend.labels.color = textColor;
                chartInstance.options.scales.y.ticks.color = textColor;
                chartInstance.options.scales.x.ticks.color = textColor;
                chartInstance.options.scales.y.grid.color = gridColor;
                chartInstance.options.scales.x.grid.color = gridColor;
                chartInstance.update();
            }

            function adicionarDados() {
                const now = new Date();
                const newLabel = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                chartInstance.data.labels.push(newLabel);
                chartInstance.data.labels.shift();

                chartInstance.data.datasets.forEach(dataset => {
                    let newValue;
                    if (dataset.label === 'pH') newValue = gerarValor(7.2, 0.5);
                    if (dataset.label === 'Turbidez') newValue = gerarValor(5, 2);
                    if (dataset.label === 'Oxigênio') newValue = gerarValor(8, 1);
                    dataset.data.push(newValue);
                    dataset.data.shift();
                });
                chartInstance.update('none'); // 'none' para uma animação suave
            }
            
            return { chartInstance, updateChartTheme, adicionarDados };
        })();
    }

    // --- 6. FORMULÁRIO DE FEEDBACK ---
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nomeInput = e.target.nome;
            if (nomeInput) {
                alert(`Obrigado pelo seu feedback, ${nomeInput.value}! Sua mensagem foi recebida.`);
                feedbackForm.reset();
            }
        });
    }

    // --- INICIALIZAÇÃO E INTERVALOS ---
    function inicializar() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
        applyTheme(savedTheme);

        // Iniciar atualizações periódicas
        setInterval(() => {
            atualizarMetricas();
            if (window.qualityChart) window.qualityChart.adicionarDados();
        }, 5000);
    }

    inicializar();
});