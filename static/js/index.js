window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown && button) {
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
            button.classList.remove('active');
        } else {
            dropdown.classList.add('show');
            button.classList.add('active');
        }
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && dropdown && button && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        if (dropdown && button) {
            dropdown.classList.remove('show');
            button.classList.remove('active');
        }
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button ? button.querySelector('.copy-text') : null;
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            if (button && copyText) {
                button.classList.add('copied');
                copyText.textContent = 'Copied!';
                
                setTimeout(function() {
                    button.classList.remove('copied');
                    copyText.textContent = 'Copy';
                }, 2000);
            }
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (button && copyText) {
                button.classList.add('copied');
                copyText.textContent = 'Copied!';
                setTimeout(function() {
                    button.classList.remove('copied');
                    copyText.textContent = 'Copy';
                }, 2000);
            }
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (scrollButton) {
        if (window.pageYOffset > 300) {
            scrollButton.classList.add('visible');
        } else {
            scrollButton.classList.remove('visible');
        }
    }
});

// Scroll-triggered entry animation observer (fade-up)
function setupFadeUpObserver() {
    const fadeElements = document.querySelectorAll('.fade-on-scroll');
    if (fadeElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-up');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    fadeElements.forEach(el => observer.observe(el));
}

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.play().catch(e => {
                    console.log('Autoplay prevented:', e);
                });
            } else {
                video.pause();
            }
        });
    }, {
        threshold: 0.5
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

$(document).ready(function() {
    var options = {
        slidesToScroll: 1,
        slidesToShow: 1,
        loop: true,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 5000,
    };

    if (typeof bulmaCarousel !== 'undefined') {
        bulmaCarousel.attach('.carousel', options);
    }
    
    if (typeof bulmaSlider !== 'undefined') {
        bulmaSlider.attach();
    }
    
    setupVideoCarouselAutoplay();
    setupFadeUpObserver();
    initRetrievalChart();
});

// ============================================================
// Retrieval Results Bar Chart (Chart.js)
// ============================================================

// Data from the retrieval results table (R@1 Batch values)
var retrievalData = {
    t2m: {
        labels: ['HO T→M', 'OI T→M', 'CL T→M'],
        datasets: {
            'P4Transformer': [53.57, 26.55, null],
            'PST-Transformer': [49.09, 30.37, 30.86],
            'Motion PointNet': [51.91, 41.37, 41.71],
            'CL4D (Ours)': [70.32, 49.40, 55.07]
        }
    },
    m2t: {
        labels: ['HO M→T', 'OI M→T', 'CL M→T'],
        datasets: {
            'P4Transformer': [58.05, 24.93, null],
            'PST-Transformer': [51.73, 25.50, 33.29],
            'Motion PointNet': [55.78, 36.18, 43.24],
            'CL4D (Ours)': [68.62, 46.97, 51.94]
        }
    }
};

// Color palette matching the slideshow (grays for baselines, green for ours)
var chartColors = {
    'P4Transformer':    { bg: '#6b6b6b', border: '#6b6b6b' },
    'PST-Transformer':  { bg: '#9a9a9a', border: '#9a9a9a' },
    'Motion PointNet':  { bg: '#c4c4c4', border: '#c4c4c4' },
    'CL4D (Ours)':      { bg: '#76ab2f', border: '#6a9a28' }
};

var retrievalChart = null;
var currentMetric = 't2m';

function buildChartDatasets(metric) {
    var data = retrievalData[metric];
    var datasets = [];
    var methods = Object.keys(data.datasets);

    methods.forEach(function(method) {
        var colors = chartColors[method];
        datasets.push({
            label: method,
            data: data.datasets[method],
            backgroundColor: colors.bg,
            borderColor: colors.border,
            borderWidth: 0,
            borderRadius: 4,
            borderSkipped: false,
            barPercentage: 0.78,
            categoryPercentage: 0.72
        });
    });

    return {
        labels: data.labels,
        datasets: datasets
    };
}

function initRetrievalChart() {
    var canvas = document.getElementById('retrievalChart');
    if (!canvas || typeof Chart === 'undefined') return;

    var ctx = canvas.getContext('2d');

    // Value labels plugin
    var datalabelsPlugin = {
        id: 'barValueLabels',
        afterDatasetsDraw: function(chart) {
            var ctx = chart.ctx;
            chart.data.datasets.forEach(function(dataset, datasetIndex) {
                var meta = chart.getDatasetMeta(datasetIndex);
                if (meta.hidden) return;
                meta.data.forEach(function(bar, index) {
                    var value = dataset.data[index];
                    if (value === null || value === undefined) return;
                    ctx.save();
                    ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif';
                    ctx.fillStyle = '#1d1d1f';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    ctx.fillText(value.toFixed(2), bar.x, bar.y - 5);
                    ctx.restore();
                });
            });
        }
    };

    // Apple-style x-axis group labels
    var groupLabelsPlugin = {
        id: 'groupLabels',
        afterDraw: function(chart) {
            var ctx = chart.ctx;
            var xAxis = chart.scales.x;
            var meta = retrievalData[currentMetric];
            var groups = [
                { label: 'HO - HumanOnly', indices: [0] },
                { label: 'OI - ObjInteractions', indices: [1] },
                { label: 'CL - Cluttered', indices: [2] }
            ];

            ctx.save();
            ctx.font = '500 12px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif';
            ctx.fillStyle = '#86868b';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';

            groups.forEach(function(group) {
                var sumX = 0;
                group.indices.forEach(function(i) {
                    sumX += xAxis.getPixelForTick(i);
                });
                var centerX = sumX / group.indices.length;
                ctx.fillText(group.label, centerX, chart.chartArea.bottom + 28);
            });
            ctx.restore();
        }
    };

    var chartData = buildChartDatasets('t2m');

    retrievalChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        plugins: [datalabelsPlugin, groupLabelsPlugin],
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 700,
                easing: 'easeOutQuart'
            },
            layout: {
                padding: {
                    top: 28,
                    bottom: 44,
                    left: 8,
                    right: 8
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(29,29,31,0.92)',
                    titleFont: { family: '-apple-system, "SF Pro Display", "Inter", sans-serif', size: 13, weight: '600' },
                    bodyFont: { family: '-apple-system, "SF Pro Display", "Inter", sans-serif', size: 12 },
                    cornerRadius: 10,
                    padding: { x: 14, y: 10 },
                    displayColors: true,
                    boxWidth: 10,
                    boxHeight: 10,
                    boxPadding: 4,
                    callbacks: {
                        label: function(context) {
                            if (context.raw === null || context.raw === undefined) return null;
                            return context.dataset.label + ': ' + context.raw.toFixed(2) + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: {
                        font: { family: '-apple-system, "SF Pro Display", "Inter", sans-serif', size: 12, weight: '500' },
                        color: '#1d1d1f',
                        padding: 6
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 85,
                    grid: {
                        color: 'rgba(0,0,0,0.05)',
                        drawTicks: false
                    },
                    border: { display: false },
                    ticks: {
                        font: { family: '-apple-system, "SF Pro Display", "Inter", sans-serif', size: 11 },
                        color: '#86868b',
                        padding: 10,
                        stepSize: 10
                    }
                }
            }
        }
    });

    // Build custom legend
    buildChartLegend();
}

function buildChartLegend() {
    var container = document.getElementById('chartLegend');
    if (!container) return;
    container.innerHTML = '';

    var methods = Object.keys(chartColors);
    methods.forEach(function(method) {
        var item = document.createElement('div');
        item.className = 'chart-legend-item' + (method === 'CL4D (Ours)' ? ' is-ours' : '');

        var swatch = document.createElement('span');
        swatch.className = 'chart-legend-swatch';
        swatch.style.backgroundColor = chartColors[method].bg;

        var label = document.createElement('span');
        label.textContent = method;

        item.appendChild(swatch);
        item.appendChild(label);
        container.appendChild(item);
    });
}

function switchChartMetric(metric) {
    if (metric === currentMetric) return;
    currentMetric = metric;

    // Update toggle buttons
    document.querySelectorAll('.chart-toggle-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.getAttribute('data-metric') === metric);
    });

    // Update chart data with animation
    if (retrievalChart) {
        var newData = buildChartDatasets(metric);
        retrievalChart.data.labels = newData.labels;
        newData.datasets.forEach(function(ds, i) {
            if (retrievalChart.data.datasets[i]) {
                retrievalChart.data.datasets[i].data = ds.data;
            }
        });
        retrievalChart.update('active');
    }
}

