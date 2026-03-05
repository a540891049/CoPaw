拉取源码:
git clone https://github.com/a540891049/CoPaw.git

进入源码目录：
cd CoPaw

切换分支:
git checkout copaw-pengliu


需要用 python -m pip 方式升级:
python -m pip install --upgrade pip setuptools wheel

使用国内镜像安装：
python -m pip install -e . -i https://pypi.tuna.tsinghua.edu.cn/simple

进入控制台：
cd console

安装依赖(需要node环境, node需要25.8.0版本以上):
```
官方网站：  https://nodejs.org/zh-cn/download
## (可选) 镜像加速下载
NVM_SOURCE=https://npm.taobao.org/mirrors/nvm/ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```
npm ci --registry=https://registry.npmmirror.com

前端构建：
npm run build

再次执行启动：
copaw app --host 0.0.0.0