class Loading {
    constructor(opt, canvas) {
        //canvas Dom节点
        this.canvas = canvas || document.getElementsByTagName('canvas')[0]
        //上下文对象
        this.ctx = this.canvas.getContext('2d')
        //画布宽
        this.W = this.canvas.width
        //画布高
        this.H = this.canvas.height
        //动画累加标识
        this.flag = 0
        this.opt = Object.assign({
            //loading形状
            type: 'chrysanthemum-rect',
            //loading半径
            radius: 16,
            //子元素个数
            num: 7,
            //子元素宽,圆环宽
            itemWidth: 6,
            //子元素高
            itemHeight: 12,
            //默认子元素颜色
            color: '#ffffff',
            //动画间隔时间
            interval: 800,
            //圆环底色
            bgColor: '#999999',
            //loading位置，默认居中
            pos_X: this.W / 2,
            pos_Y: this.H / 2
        }, opt)
        //兼容
        window.requestAnimationFrame =
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            (cb => { setTimeout(cb, 1000 / 60) })
        let _self = this
        reapeateAnimate()
        //loop不失去this对象
        function reapeateAnimate() {
            _self.Init()
            requestAnimationFrame(reapeateAnimate)
        }
    }
    Init() {
        let opt = this.opt
        switch (opt.type.slice(0, opt.type.indexOf('-'))) {
            case 'chrysanthemum': opt.color = this.HexToRGB(opt.color); this.chrysanthemum(); break;
            case 'scroll': this.scroll(); break;
            default: this.chrysanthemum(); break;
        }
    }
    chrysanthemum() {
        let ctx = this.ctx, opt = this.opt, interval = opt.interval, opacity
        //变换时间替换为帧
        if (this.flag % Math.round(this.MSToFrame(interval)) === 0) {
            this.clear()
            for (let i = 0; i < opt.num; i++) {
                ctx.save()
                ctx.beginPath()
                opacity = (Math.ceil(opt.num / 2) + i) % opt.num / opt.num
                this.createChry(i, opacity)
                ctx.restore()
            }
        }
        this.flag++
    }
    //具体分类（旋转方式）
    createChry(idx, ipa) {
        let opt = this.opt, ctx = this.ctx, radial, deg, sin, cos, color
        radial = opt.radius
        deg = 2 * Math.PI * (idx + 1 + this.flag / this.MSToFrame(opt.interval)) / opt.num
        sin = Math.sin(deg)
        cos = Math.cos(deg)
        switch (opt.type.slice(opt.type.indexOf("-") + 1)) {
            case 'circle':
                ctx.arc(opt.pos_X - sin * radial, opt.pos_Y + cos * radial, opt.itemWidth / 2, 0, 2 * Math.PI, false)
                ctx.fillStyle = 'rgba(' + opt.color.slice(4, -1) + ',' + ipa + ')'
                ctx.fill()
                break;
            case 'sizeCircle':
                ctx.arc(opt.pos_X - sin * radial, opt.pos_Y + cos * radial, (ipa + 0.1) * opt.itemWidth / 2, 0, 2 * Math.PI, false)
                ctx.fillStyle = 'rgba(' + opt.color.slice(4, -1) + ',' + ipa + ')'
                ctx.fill()
                break;
            case 'reverse':
                let opa
                if (idx <= Math.round(opt.num / 3)) {
                    opa =1- Math.abs((idx - Math.round(opt.num / 6)) / Math.round(opt.num / 3)) 
                    color = 'rgba' + this.HexToRGB(opt.color).slice(3, -1) + ',' + opa + ')'
                }
                else { color = opt.bgColor }
                this.createRectItem(color, sin, cos)
                break;
            case 'sector':
                let calcu = (2 * Math.PI - (opt.num / (radial * 10)) * 2 * Math.PI) / opt.num
                ctx.arc(opt.pos_X, opt.pos_Y, radial + opt.itemHeight, deg, deg + calcu, false)
                color = (idx === 0) ? opt.color : opt.bgColor
                ctx.strokeStyle = color
                ctx.lineWidth = opt.itemWidth
                ctx.stroke()
                ctx.save()
                break;
            default:
                color = 'rgba(' + opt.color.slice(4, -1) + ',' + ipa + ')'
                this.createRectItem(color, sin, cos)
                break;
        }
    }
    // 椭圆形
    createRectItem(color, sin, cos) {
        let opt = this.opt, ctx = this.ctx
        let min_radial = opt.radius - opt.itemHeight / 2
        let max_radial = opt.radius + opt.itemHeight / 2
        ctx.strokeStyle = color
        ctx.lineWidth = opt.itemWidth
        ctx.lineCap = 'round'
        ctx.moveTo(opt.pos_X - sin * min_radial, opt.pos_Y + cos * min_radial)
        ctx.lineTo(opt.pos_X - sin * max_radial, opt.pos_Y + cos * max_radial)
        ctx.stroke()
    }
    //圆环形
    scroll() {
        this.clear()
        let ctx = this.ctx, opt = this.opt, radial = opt.radius + opt.itemWidth, deg
        ctx.save()
        ctx.beginPath()
        deg = 2 * Math.PI * (this.flag % this.MSToFrame(opt.interval)) / this.MSToFrame(opt.interval)
        switch (opt.type.slice(opt.type.indexOf('-') + 1)) {
            case 'ball':
                this.createCircleRing(radial)
                ctx.beginPath()
                ctx.shadowColor = opt.color
                ctx.shadowBlur = 4
                ctx.strokeStyle = opt.color
                ctx.lineCap = 'round'
                ctx.arc(opt.pos_X, opt.pos_Y, radial, deg, deg + Math.PI / 5, false)
                ctx.stroke()
                break;
            case 'fire':
                let ratio = 1 / 2
                this.createCircleRing(radial)
                this.createBalls(opt.itemWidth * 2, radial, ratio, deg)
                break;
            default:
                let sum = opt.radius * 3, scale = 7 / 4/* ,radial1=opt.radius+opt.itemWidth/2 */
                this.createBalls(sum, radial, scale, deg)
                break;
        }
        ctx.restore()
        this.flag++
    }
    //圆环中转动的元素
    createBalls(sum, r, scale, deg) {
        let ctx = this.ctx, opa, sin, cos, opt = this.opt
        for (let i = 0; i < sum; i++) {
            ctx.save()
            ctx.beginPath()
            opa = (i % sum) / sum
            sin = Math.sin(deg + opa * Math.PI * scale)
            cos = Math.cos(deg + opa * Math.PI * scale)
            ctx.fillStyle = 'rgba' + this.HexToRGB(opt.color).slice(3, -1) + ',' + opa + ')'
            ctx.arc(opt.pos_X - sin * r, opt.pos_Y + cos * r, opt.itemWidth / 2, 0, 2 * Math.PI, false)
            ctx.fill()
            ctx.restore()
        }
    }
    //圆环
    createCircleRing(r) {
        let ctx = this.ctx, opt = this.opt
        ctx.strokeStyle = opt.bgColor
        ctx.lineWidth = opt.itemWidth
        ctx.arc(opt.pos_X, opt.pos_Y, r, 0, 2 * Math.PI, false)
        ctx.stroke()
        ctx.save()
        ctx.restore()
    }
    clear() {
        //清空画布，canvas动画由帧组成，不是在即成图像上移动已有元素(没有这个概念)
        this.ctx.clearRect(0, 0, this.W, this.H)
    }
    FrameToMs(frames) {
        return frames * 1000 / 60
    }
    MSToFrame(ms) {
        return ms * 60 / 1000
    }
    HexToRGB(color) {
        if (color[0] === "#") {
            let colur = color.slice(1)
            if (colur.length === 3) {
                colur = colur[0] + colur[0] + colur[1] + colur[1] + colur[2] + colur[2]
            }
            return 'rgb(' + parseInt('0x' + colur.slice(0, 2)) + ',' + parseInt('0x' + colur.slice(2, 4)) + ',' + parseInt('0x' + colur.slice(4)) + ")"
        }
        return color

    }
}














































