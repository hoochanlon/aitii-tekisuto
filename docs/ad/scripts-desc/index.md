# Powershell

## BAT 与 Powershell 区别

BAT（批处理文件）Windows 传统脚本语言，基于 DOS 命令，主要用于简单的自动化任务。

PowerShell 现代化的脚本语言和命令行外壳，基于 .NET Framework/.NET Core，功能强大的系统管理和自动化工具。

## BAT 当前缺陷

batch 当前的问题：

* 文件处理有限：只能逐行处理文本，没有原生的 JSON/XML 解析，二进制文件处理困难。
* 错误处理不足：没有 try-catch 机制，错误信息不详细，难以定位问题源头
* 代码维护困难：可读性差，变量跟踪困难，数学计算能力弱，并发处理困难

## Powershell 缺点与优势

powershell 缺点

* 启动延迟问题
* 内存占用高
* 执行策略麻烦，代码签名要求
* 复杂语法结构

PowerShell 优势

* 模块化，版本控制友好，比 bat 易维护
* 模块系统，.NET 集成，API 支持，扩展强
* 完善的错误处理，事务支持，可靠性好
* 丰富的模块库，社区支持良好

Powershell 是非常不错的替代方案，但 BAT 仍然在简单任务和兼容性要求高的场景中有一席之地，建议根据具体需求选择合适的工具，对于新的 Windows 环境，优先考虑 PowerShell。