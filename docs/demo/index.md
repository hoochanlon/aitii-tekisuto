---
title: Demo
# icon: material/newspaper-variant-outline
---


## 热重载

热重载问题：[mkdocs serve doesn't reload upon change anymore](https://github.com/squidfunk/mkdocs-material/issues/8478)


## 旁白


!!! info 标记

!!! Tip
    这是提示效果
    ```
    !!! Tip
        这是提示效果
    ```

!!! warning
    这是警告效果
    ```
    !!! warning
        这是警告效果   
    ```

???+ question "问题"
    这是问题折叠，默认展开效果 
    ```
    ???+ question "问题"
        这是问题折叠，默认展开效果 
    ```


??? question "问题折叠"
    这是问题折叠效果
    ```
    ??? question "问题折叠"
        这是问题折叠效果
    ```

## 卡片

<div class="grid cards" markdown>

- :fontawesome-solid-earth-americas: __[global]__ – 地球图标
- :material-page-layout-sidebar-left: __[sidebar]__ – 侧边栏图标 

</div>

[global]: https://example.com
[sidebar]: https://example.com


## 小贴条


<!-- md:version 9.7.0 --> 
<!-- md:flag experimental -->


## 代码块

代码1

```py hl_lines="2 3"
def bubble_sort(items):
    for i in range(len(items)):
        for j in range(len(items) - 1 - i):
            if items[j] > items[j + 1]:
                items[j], items[j + 1] = items[j + 1], items[j]
```


代码2

=== ":material-apple: macOS"

    ``` sh
    . venv/bin/activate
    ```

=== ":fontawesome-brands-windows: Windows"

    ``` sh
    . venv/Scripts/activate
    ```

=== ":material-linux: Linux"

    ``` sh
    . venv/bin/activate
    ```