# ntracker
  todo Добавить описание проекта сюда...

## Как запустить
0) скачиваем проект: 
```bash
git clone https://github.com/Exctues/ntracker
```
1) через терминал заходим в корневую папку проекта и устанавливаем все необходимые библиотеки командой:
```bash
cd ntracker
pip install -r requirements.txt
```
2) запускаем: 
```bash
python main.py --SAVE_FOLDER=/home/alex/ntracker/savefolder --YADISK_TOKEN="token_uuid"`
```
Параметры:
`SAVE_FOLDER` указывает в какой папке мы храним наши данные временно.
`YADISK_TOKEN` указывает токен, с помощью которого мы получаем разрешение на работу с яндекс диском

2) Если все корректно запущено, то заходим на http://127.0.0.1:8000 и смотрим как это работает 


## References
Для слияние лиц мы используем нейросеть babygun отсюда https://github.com/tg-bomze/BabyGAN 
