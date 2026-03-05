需要用 python -m pip 方式升级:
python -m pip install --upgrade pip setuptools wheel

使用国内镜像安装：
python -m pip install -e . -i https://pypi.tuna.tsinghua.edu.cn/simple

进入控制台：
cd console

安装依赖:
npm ci --registry=https://registry.npmmirror.com

前端构建：
npm run build

再次执行启动：
copaw app --host 0.0.0.0