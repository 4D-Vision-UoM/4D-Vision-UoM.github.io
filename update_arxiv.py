import os

layout_file = '/Users/sasika/my_projects/sasikaa073.github.io/_layouts/swiss-project.liquid'
project_file = '/Users/sasika/my_projects/sasikaa073.github.io/_projects/0-interactive-4d-point-cloud-retrieval.md'

# 1. Update layout to support arxiv button
with open(layout_file, 'r') as f:
    layout_content = f.read()

if '{% if page.arxiv %}' not in layout_content:
    layout_content = layout_content.replace(
        '{% if page.github or page.website or page.project_page %}',
        '{% if page.github or page.website or page.project_page or page.arxiv %}'
    )
    
    arxiv_button = """
                    {% if page.arxiv %}
                    <a href="{{ page.arxiv }}" class="swiss-btn" target="_blank">
                        <i class="ai ai-arxiv"></i>
                        <span>arXiv</span>
                    </a>
                    {% endif %}"""
    
    layout_content = layout_content.replace(
        '{% if page.website %}',
        arxiv_button.strip() + '\n                    {% if page.website %}'
    )

    with open(layout_file, 'w') as f:
        f.write(layout_content)
    print("Updated layout.")

# 2. Update project file to add arxiv frontmatter
with open(project_file, 'r') as f:
    project_content = f.read()

if 'arxiv:' not in project_content:
    project_content = project_content.replace(
        'project_page: https://4d-vision-uom.github.io/',
        'project_page: https://4d-vision-uom.github.io/\narxiv: https://arxiv.org/abs/2608.18734'
    )
    with open(project_file, 'w') as f:
        f.write(project_content)
    print("Updated project frontmatter.")
