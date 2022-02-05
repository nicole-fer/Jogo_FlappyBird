/* 
Funcao que altera a cor do cenario 
*/
function darkMode() {
    var cen = localStorage.getItem("cenario")
    if (cen == "noite") {
        const areaDoJogo = document.querySelector("[wm-flappy]").classList
        areaDoJogo.add("dark")
    }
}

function novoElemento(tagName, className) {
    const elemento = document.createElement(tagName)
    elemento.className = className
    return elemento
}
/* Na function barreira deve ser feita algumas alterações para que possa abranger o dark mode */
function Barreira(reversa = false) {
    var cen = localStorage.getItem("cenario")
    if (cen == "noite") {
        this.elemento = novoElemento('div', 'barreira')
        const borda = novoElemento('div', 'darkBorda')
        const corpo = novoElemento('div', 'darkCorpo')
        this.elemento.appendChild(reversa ? corpo : borda)
        this.elemento.appendChild(reversa ? borda : corpo)

        this.setAltura = altura => corpo.style.height = `${altura}px`
    } else {
        this.elemento = novoElemento('div', 'barreira')
        const borda = novoElemento('div', 'borda')
        const corpo = novoElemento('div', 'corpo')
        this.elemento.appendChild(reversa ? corpo : borda)
        this.elemento.appendChild(reversa ? borda : corpo)

        this.setAltura = altura => corpo.style.height = `${altura}px`
    }
}

function ParDeBarreiras(altura, abertura, popsicaoNaTela) {
    this.elemento = novoElemento('div', 'par-de-barreiras')
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)


    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = popsicaoNaTela => this.elemento.style.left = `${popsicaoNaTela}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(popsicaoNaTela)
}

/* Na function Barreiras foi feito um if para caso o usuario entre com um valor de velocidade entre 1 e 10 ele possa aumentar a velocidade */

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]
    var velocidade = localStorage.getItem("velocidade")
    var i = 0
    if (velocidade == "1") {
        var i = 1
    } else if (velocidade == "2") {
        var i = 2
    } else if (velocidade == "3") {
        i = 3
    } else if (velocidade == "4") {
        i = 4
    } else if (velocidade == "5") {
        i = 5
    } else if (velocidade == "6") {
        i = 6
    } else if (velocidade == "7") {
        i = 7
    } else if (velocidade == "8") {
        i = 8
    } else if (velocidade == "9") {
        i = 9
    } else if (velocidade == "10") {
        i = 10
    }

    const deslocamento = i //recebe o valor do usuario
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }
            const meio = largura / 2
            const cruzouMeio = par.getX() + deslocamento >= meio &&
                par.getX() < meio
            if (cruzouMeio) {
                notificarPonto()
            }
        })
    }
}

/* o if foi feito para abrenger mais dois personagens além do flip, o usuario escolhera com qual dos três ele deseja jogar */

function Passaro(alturaJogo) {
    let voando = false

    var person = localStorage.getItem("personagem")
    if (person == "flip") {
        this.elemento = novoElemento('img', 'passaro')
        this.elemento.src = 'img/passaro.png'
    } else if (person == "pica") {
        this.elemento = novoElemento('img', 'passaro')
        this.elemento.src = 'img/pica.png'
    } else if (person == "piupiu") {
        this.elemento = novoElemento('img', 'passaro')
        this.elemento.src = 'img/piupiu.png'
    }

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientWidth

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }
    this.setY(alturaJogo / 2)
}


function Progresso() {

    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB) {

    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()
    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

/* A function colidiu foi aprimorada para receber o modo treino, caso o usuario opte por tipo R, que é o modo real, ele vai continuar fncionando normalmente, ou seja ira colidir, caso esolha o tipoT, ou seja o modo treinar, ele não ira colidir  */
function colidiu(passaro, barreiras) {
    let colidiu = false

    barreiras.pares.forEach(parDeBarreiras => {
        var treino = localStorage.getItem("tipoDeJogo")
        if (treino == "tipoR") {
            if (!colidiu) {
                const superior = parDeBarreiras.superior.elemento
                const inferior = parDeBarreiras.inferior.elemento
                colidiu = estaoSobrepostos(passaro.elemento, superior) ||
                    estaoSobrepostos(passaro.elemento, inferior)
            }
        } else if (treino == "tipoT") {
            let colidiu = false
        }

    })
    return colidiu

}

/* a function FlappyBird foi onde mais teve alterações começando por um if que diz a quantidade de pontos a serem incrementadas 1, 10 ou 100, de acordo com o que usuario querer */
function FlappyBird() {
    var p = localStorage.getItem("pontos")
    var pontos = 0
    var paa = 0
    if (p == "pont1") {
        paa = paa + 1
    } else if (p == "pont10") {
        paa = paa + 10
    } else if (p == "pont100") {
        paa = paa + 100
    }

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    var abert = localStorage.getItem("abertura")
    var dist = localStorage.getItem("distancia")

    /* Já aqui, o if foi utilizado para abranger as possibilidades, tanto de abertura quanto distancia entre os canos indo do facil até o dificil, perceba também que em atualizar pontos() ele receber o valor que foi instruido no if acima , ou seja vai atualizar de acordo com o que o usuario querer */
    if (abert == "aberturaF" && dist == "distanciaF") {
        var progresso = new Progresso()
        var barreiras = new Barreiras(altura, largura, 400, 500, () => progresso.atualizarPontos(pontos = pontos + paa))
        var passaro = new Passaro(altura)
    } else if (abert == "aberturaF" && dist == "distanciaM") {
        var progresso = new Progresso()
        var barreiras = new Barreiras(altura, largura, 400, 400, () => progresso.atualizarPontos(pontos = pontos + paa))
        var passaro = new Passaro(altura)
    } else if (abert == "aberturaF" && dist == "distanciaD") {
        var progresso = new Progresso()
        var barreiras = new Barreiras(altura, largura, 400, 300, () => progresso.atualizarPontos(pontos = pontos + paa))
        var passaro = new Passaro(altura)
    } else if (abert == "aberturaM" && dist == "distanciaF") {
        var progresso = new Progresso()
        var barreiras = new Barreiras(altura, largura, 300, 500, () => progresso.atualizarPontos(pontos = pontos + paa))
        var passaro = new Passaro(altura)
    } else if (abert == "aberturaM" && dist == "distanciaM") {
        var progresso = new Progresso()
        var barreiras = new Barreiras(altura, largura, 300, 400, () => progresso.atualizarPontos(pontos = pontos + paa))
        var passaro = new Passaro(altura)
    } else if (abert == "aberturaM" && dist == "distanciaD") {
        var progresso = new Progresso()
        var barreiras = new Barreiras(altura, largura, 300, 300, () => progresso.atualizarPontos(pontos = pontos + paa))
        var passaro = new Passaro(altura)
    } else if (abert == "aberturaD" && dist == "distanciaF") {
        var progresso = new Progresso()
        var barreiras = new Barreiras(altura, largura, 200, 500, () => progresso.atualizarPontos(pontos = pontos + paa))
        var passaro = new Passaro(altura)
    } else if (abert == "aberturaD" && dist == "distanciaM") {
        var progresso = new Progresso()
        var barreiras = new Barreiras(altura, largura, 200, 400, () => progresso.atualizarPontos(pontos = pontos + paa))
        var passaro = new Passaro(altura)
    } else if (abert == "aberturaD" && dist == "distanciaD") {
        var progresso = new Progresso()
        var barreiras = new Barreiras(altura, largura, 200, 300, () => progresso.atualizarPontos(pontos = pontos + paa))
        var passaro = new Passaro(altura)
    }

    /* para a velocidade do personagem, foi feito da mesma forma das outras situações, um if que vai abranger o que o usuario solicitar, vale ressaltar que todos os valores se dão graças a localStorage que permite armazenar os valores que o usuario quer em uma varivel e a partir do getItem podemos recuperar esse valor */
    var speedPersonagem = localStorage.getItem("velocidadePersonagem")
    if (speedPersonagem == "velB") {
        speedPersonagem = 30
    } else if (speedPersonagem == "velM") {
        speedPersonagem = 20
    } else if (speedPersonagem == "velD") {
        speedPersonagem = 10
    }
    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    /* por fim, window.alert vai alertar o usuario sobre o fim do jogo, contendo na informação o nome e a pontuação */
    var name = localStorage.getItem("nome")
    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
                window.alert(`------GAME OVER, ${name}------, sua pontuação foi: ${pontos}`)
            }
        }, speedPersonagem)
    }
}
darkMode() // chama a função dark mode
new FlappyBird().start()